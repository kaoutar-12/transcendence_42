"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import ParticlesBackground from "@/components/auth/particales";

export default function OTPForm() {
  const [formData, setFormData] = useState({
    OTP: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize particles

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      	
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login_otp/`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({'OTP':formData.OTP}),
          	});
			const data = await res.json();
			if (res.ok) {
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
            
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">
                  Enter 2FA Code
                </label>
                <input
                  type="text"
                  onChange={(e) =>
                    setFormData({...formData, OTP: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-500"
                  placeholder="Enter OTP code"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Please enter the verification code sent to your device
                </p>
              </div>
            

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
			
          </form>
        </div>
      </div>
    </div>
  );
}
