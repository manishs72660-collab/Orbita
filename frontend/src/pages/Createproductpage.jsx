import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import axiosClient from "../utils/Axiosclient";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const productSchema = z
  .object({
    name: z.string().trim().min(2, "Product name is required"),
    description: z.string().trim().min(10, "Description must be at least 10 characters"),
    category: z.string().trim().min(1, "Category is required"),
    stock: z.coerce.number({ invalid_type_error: "Stock is required" }).int().min(0, "Stock cannot be negative"),
    originalPrice: z.coerce
      .number({ invalid_type_error: "Original price is required" })
      .positive("Price must be greater than 0"),
    discount: z.coerce
      .number({ invalid_type_error: "Enter a valid discount" })
      .min(0, "Discount cannot be negative")
      .max(100, "Discount cannot exceed 100")
      .optional()
      .default(0),
    images: z
      .custom((val) => val instanceof FileList)
      .refine((files) => files && files.length > 0, "Add at least one product image")
      .refine((files) => !files || files.length <= MAX_IMAGES, `Maximum ${MAX_IMAGES} images allowed`)
      .refine(
        (files) => !files || Array.from(files).every((f) => f.size <= MAX_FILE_SIZE),
        "Each image must be under 5MB"
      )
      .refine(
        (files) => !files || Array.from(files).every((f) => ACCEPTED_TYPES.includes(f.type)),
        "Only jpeg, jpg, png, webp images are allowed"
      ),
  });

export default function CreateProductPage() {
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    mode: "onBlur",
  });

  const originalPrice = Number(watch("originalPrice")) || 0;
  const discount = Number(watch("discount")) || 0;
  const finalPrice = (originalPrice - (originalPrice * discount) / 100).toFixed(2);

  const handleImagePreview = (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_IMAGES);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const onSubmit = async (data) => {
    setServerError("");
    setSuccess(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("stock", data.stock);
      formData.append("originalPrice", data.originalPrice);
      formData.append("discount", data.discount ?? 0);
      Array.from(data.images).forEach((img) => formData.append("images", img));

      await axiosClient.post("/product/create", formData, {
        headers: { "Content-Type": undefined },
      });

      setSuccess(true);
      reset();
      setPreviews([]);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to create product";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent ${
      hasError
        ? "border-red-600 focus:ring-red-500"
        : "border-slate-700 focus:ring-orange-500"
    }`;

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/admin" className="text-sm text-slate-400 hover:text-white">
          ← Back to admin panel
        </Link>

        <div className="mb-6 mt-4">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Add a new product
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Fill in the details below to list a product
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Product name
              </label>
              <input
                type="text"
                placeholder="Wireless headphones"
                className={inputClass(errors.name)}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe the product..."
                className={`${inputClass(errors.description)} resize-none`}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="Electronics"
                  className={inputClass(errors.category)}
                  {...register("category")}
                />
                {errors.category && (
                  <p className="text-xs text-red-400 mt-1">{errors.category.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Stock quantity
                </label>
                <input
                  type="number"
                  placeholder="100"
                  className={inputClass(errors.stock)}
                  {...register("stock")}
                />
                {errors.stock && (
                  <p className="text-xs text-red-400 mt-1">{errors.stock.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Original price (₹)
                </label>
                <input
                  type="number"
                  placeholder="1999"
                  className={inputClass(errors.originalPrice)}
                  {...register("originalPrice")}
                />
                {errors.originalPrice && (
                  <p className="text-xs text-red-400 mt-1">{errors.originalPrice.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Discount (%)
                </label>
                <input
                  type="number"
                  placeholder="10"
                  className={inputClass(errors.discount)}
                  {...register("discount")}
                />
                {errors.discount && (
                  <p className="text-xs text-red-400 mt-1">{errors.discount.message}</p>
                )}
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">Final price</span>
              <span className="text-lg font-semibold text-orange-400">
                ₹{finalPrice}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Product images (up to {MAX_IMAGES})
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                multiple
                className="w-full text-sm text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-600 file:text-white hover:file:bg-orange-500 file:cursor-pointer cursor-pointer"
                {...register("images", { onChange: handleImagePreview })}
              />
              {errors.images && (
                <p className="text-xs text-red-400 mt-1">{errors.images.message}</p>
              )}
              {previews.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {previews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`preview ${i + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                    />
                  ))}
                </div>
              )}
            </div>

            {serverError && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
                {serverError}
              </p>
            )}
            {success && (
              <p className="text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-900 rounded-lg px-3 py-2">
                Product created successfully
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Creating product..." : "Create product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}