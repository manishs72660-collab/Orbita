const elasticClient = require("../config/elasticsearch");

const PRODUCT_INDEX = "products";

// ---------------- INDEX SETUP ----------------
// "search_as_you_type" on name gives us prefix + typo-tolerant autocomplete
// for free (it creates name._2gram / name._3gram subfields internally).
const ensureProductIndex = async () => {
    const exists = await elasticClient.indices.exists({ index: PRODUCT_INDEX });
    if (exists) return;

    await elasticClient.indices.create({
        index: PRODUCT_INDEX,
        mappings: {
            properties: {
                name: { type: "search_as_you_type" },
                description: { type: "text" },
                category: { type: "keyword" },
                originalPrice: { type: "float" },
                discount: { type: "float" },
                finalPrice: { type: "float" },
                stock: { type: "integer" },
                rating: { type: "float" },
                image: { type: "keyword", index: false },
                createdAt: { type: "date" },
            },
        },
    });
};

const toDoc = (product) => ({
    name: product.name,
    description: product.description,
    category: product.category,
    originalPrice: product.originalPrice,
    discount: product.discount,
    finalPrice: product.finalPrice,
    stock: product.stock,
    rating: product.rating,
    image: product.images?.[0]?.url || null,
    createdAt: product.createdAt,
});

// ---------------- SYNC (called from product controller) ----------------
// Using .index() (not .create()) for both create+update means it's an
// upsert - safe to call even if the doc doesn't exist yet.
const indexProduct = async (product) => {
    try {
        await elasticClient.index({
            index: PRODUCT_INDEX,
            id: product._id.toString(),
            document: toDoc(product),
            refresh: "wait_for",
        });
    } catch (error) {
        // Never let a search-index failure break the actual product write.
        console.log(`ES index failed for product ${product._id}:`, error.message);
    }
};

const deleteProductIndex = async (id) => {
    try {
        await elasticClient.delete({ index: PRODUCT_INDEX, id: id.toString() });
    } catch (error) {
        if (error.meta?.statusCode !== 404) {
            console.log(`ES delete failed for product ${id}:`, error.message);
        }
    }
};

// ---------------- SEARCH ----------------
const searchProducts = async ({ q, category, page = 1, limit = 10 }) => {
    const from = (page - 1) * limit;

    const must = q
        ? [
              {
                  multi_match: {
                      query: q,
                      fields: ["name^3", "description", "category"],
                      fuzziness: "AUTO",
                      type: "best_fields",
                  },
              },
          ]
        : [{ match_all: {} }];

    const filter = category ? [{ term: { category } }] : [];

    const result = await elasticClient.search({
        index: PRODUCT_INDEX,
        from,
        size: limit,
        query: { bool: { must, filter } },
    });

    return {
        total: result.hits.total.value,
        hits: result.hits.hits.map((h) => ({ _id: h._id, ...h._source, score: h._score })),
    };
};

// ---------------- AUTOCOMPLETE ----------------
// bool_prefix over the search_as_you_type subfields matches "as you type",
// e.g. typing "wire ear" starts matching "wireless earbuds" immediately.
const autocompleteProducts = async (q, limit = 6) => {
    if (!q || !q.trim()) return [];

    const result = await elasticClient.search({
        index: PRODUCT_INDEX,
        size: limit,
        query: {
            multi_match: {
                query: q,
                type: "bool_prefix",
                fields: ["name", "name._2gram", "name._3gram"],
            },
        },
    });

    return result.hits.hits.map((h) => ({ _id: h._id, ...h._source }));
};

module.exports = {
    PRODUCT_INDEX,
    ensureProductIndex,
    indexProduct,
    deleteProductIndex,
    searchProducts,
    autocompleteProducts,
};