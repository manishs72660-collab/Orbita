import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utils/Axiosclient";
const loginSchema = z.object({
  usermail: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  username: z.string().trim().min(2, "Name must be at least 2 characters"),
  usermail: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  mobile_num: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  city: z.string().trim().min(1, "City is required"),
  home: z.string().trim().min(1, "Address is required"),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const schema = mode === "login" ? loginSchema : signupSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const switchMode = () => {
    setServerError("");
    reset();
    setMode(mode === "login" ? "signup" : "login");
  };

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);

    try {
      let res;

      if (mode === "login") {
        res = await axiosClient.post("/auth/login", {
          usermail: data.usermail,
          password: data.password,
        });
      } else {
        res = await axiosClient.post("/auth/register", {
          username: data.username,
          usermail: data.usermail,
          mobile_num: data.mobile_num,
          password: data.password,
          address: {
            city: data.city,
            home: data.home,
            pincode: data.pincode,
          },
        });
      }

      // Your API wraps the created/logged-in user in `message`.
      onAuthSuccess?.(res.data?.message);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Something went wrong";
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {mode === "login"
              ? "Sign in to continue shopping"
              : "Join to start shopping"}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  placeholder="Aman Kumar"
                  className={inputClass(errors.username)}
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-xs text-red-400 mt-1">{errors.username.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Email
              </label>
              <input
                type="text"
                placeholder="you@example.com"
                className={inputClass(errors.usermail)}
                {...register("usermail")}
              />
              {errors.usermail && (
                <p className="text-xs text-red-400 mt-1">{errors.usermail.message}</p>
              )}
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Mobile number
                </label>
                <input
                  type="text"
                  placeholder="9876543210"
                  className={inputClass(errors.mobile_num)}
                  {...register("mobile_num")}
                />
                {errors.mobile_num && (
                  <p className="text-xs text-red-400 mt-1">{errors.mobile_num.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClass(errors.password)}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Patna"
                    className={inputClass(errors.city)}
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-400 mt-1">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="800001"
                    className={inputClass(errors.pincode)}
                    {...register("pincode")}
                  />
                  {errors.pincode && (
                    <p className="text-xs text-red-400 mt-1">{errors.pincode.message}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="House no, street"
                    className={inputClass(errors.home)}
                    {...register("home")}
                  />
                  {errors.home && (
                    <p className="text-xs text-red-400 mt-1">{errors.home.message}</p>
                  )}
                </div>
              </div>
            )}

            {serverError && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign in"
                : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="text-orange-400 hover:text-orange-300 font-medium"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}