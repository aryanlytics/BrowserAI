"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import api from "@/lib/api";
import { forgetPasswordSchema } from "@browser-ai/validators/zod/auth";

const ResetPasswordPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEmail(e.target.value);

    // Clear email error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({
        ...prev,
        email: "",
      }));
    }
  };

  const submitHandler = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const result =
      forgetPasswordSchema.safeParse({
        email,
      });

    if (!result.success) {
      const formattedErrors: Record<
        string,
        string
      > = {};

      result.error.issues.forEach((issue) => {
        formattedErrors[
          issue.path[0] as string
        ] = issue.message;
      });

      setErrors(formattedErrors);
      return;
    }

    // Clear old validation errors
    setErrors({});

    setIsLoading(true);

    const toastId = toast.loading(
      "Sending OTP..."
    );

    try {
      await api.post(
        "/api/auth/forgotpassword",
        {
          email,
        }
      );

      toast.success(
        "OTP sent successfully",
        {
          id: toastId,
        }
      );

      router.push(
        `/forgetpasswordotp?email=${encodeURIComponent(
          email
        )}`
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          "An error occurred. Please try again.";

        toast.error(
          "Request Failed",
          {
            id: toastId,
            description: message,
          }
        );

        setErrors({
          email: message,
        });
      } else {
        toast.error(
          "Unexpected error",
          {
            id: toastId,
            description:
              "Something went wrong. Please try again.",
          }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Find Your Account
        </h2>

        <p className="text-gray-500">
          We will send an OTP to your email.
        </p>
      </div>

      <form
        onSubmit={submitHandler}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="email"
            className="block mb-2"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={handleInput}
            autoComplete="email"
            className={`w-full border rounded-md p-2 ${
              errors.email
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="Garnet_Shelling_Cobra@gmail.com"
          />

          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white rounded-md p-2 disabled:opacity-50"
        >
          {isLoading
            ? "Sending OTP..."
            : "Send OTP"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;