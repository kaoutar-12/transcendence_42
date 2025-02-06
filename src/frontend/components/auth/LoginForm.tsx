"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import ParticlesBackground from "@/components/auth/particales";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    OTP: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);

  // Initialize particles

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.action === "triger on") {
          setShow2FA(true);
          return;
        }
        if (data.error) {
          setError(data.error);
          return;
        }
        router.push("/home");
      } else {
        setError(data.error || "Login failed");
	}
} catch (error) {
	setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      <ParticlesBackground />

      <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center p-4">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo_login.svg"
            alt="Logo"
            width={120}
            height={50}
            className="cursor-pointer"
            priority
            onClick={() => {
              router.push("/");
            }}
			/>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
          <h1 className="text-2xl text-gray-800 text-center mb-8">
            Welcome Back!
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!show2FA ? (
              <>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="Email"
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:border-gray-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:border-gray-500 focus:outline-none"
                  />
                </div>
              </>
            ) : (
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">
                  Enter 2FA Code
                </label>
                <input
                  type="text"
                  onChange={(e) =>
                    setFormData({ ...formData, OTP: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-500"
                  placeholder="Enter OTP code"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Please enter the verification code sent to your device
                </p>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              className="w-2/4 mx-auto block py-3 px-4 bg-gray-200/80 hover:bg-gray-300/80 text-red-600 font-semibold text-xl rounded-xl border-2 border-red-600 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "loading..." : "Log in"}
            </button>
			{!show2FA ? (
        <>
          <div className="relative flex items-center py-5">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
          </div>
			  <button
			  // type="submit"
        onClick={() => {
          router.push("/oauth");
        }}
			  className="w-3/4 mx-auto block py-3 px-4 bg-gray-200/80 hover:bg-gray-300/80 text-red-600 font-semibold text-xl rounded-xl border-2 border-red-600 transition-all duration-200"
			  disabled={isLoading}
			>
			       {isLoading ? (
    				    <span>Loading...</span>
    				  ) : (
						<div className="flex items-center justify-center space-x-3">
							<div className="w-12 h-auto">

    				      <Image
    				        src="/42_Logo.svg"
    				        alt="42 Logo"
    				        width={50}
    				        height={50}
							/>
							</div>
    				      <span>Login with Intra</span>
    				    </div>
    				  )}
    				</button>

            </>

			) : (
			  <div></div>
			)}
            {!show2FA ? (
				<p className="text-center text-gray-600 text-sm">
                Don&apos;t have an account?{" "}
                <a
                  onClick={() => {
					  router.push("/register");
					}}
					className="text-red-500 hover:text-red-600 cursor-pointer"
					>
                  Register here
                </a>
              </p>
            ) : (
				<div></div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
