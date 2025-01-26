/* eslint-disable react/no-unescaped-entities */
"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();

  const teamMembers = [
    { id: 1, name: "Houdaifa Znagui", src: "/clarence/houdaifa.webp" },
    { id: 2, name: "Yahya Rhiba", src: "/clarence/yahya.webp" },
    { id: 3, name: "Reda Ghouzraf", src: "/clarence/reda.webp" },
    { id: 4, name: "Kaoutar Mouradi", src: "/clarence/kaoutar.webp" },
  ];

  return (
    <div className="w-screen min-h-screen bg-black text-white ">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-8 max-w-screen-2xl mx-auto">
        <div className="flex items-center">
          <div className="h-12 w-24 relative">
            <Image
              src="/logo_login.svg"
              alt="Pong Logo"
              className="object-contain"
              width={96}
              height={48}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <button
            className="bg-red-700 px-6 py-2 rounded-md hover:bg-red-500 transition"
            onClick={() => {
              router.push("/login");
            }}
          >
            Sign in
          </button>
          <button
            className="bg-red-700 px-6 py-2 rounded-md hover:bg-red-500 transition"
            onClick={() => {
              router.push("/register");
            }}
          >
            Register
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto px-6 ">
        {/* Hero Section */}
        <div className="py-16 lg:py-24">
          <p className="text-red-600 text-sm lg:text-base mb-6">
            ONLINE PONG GAME
          </p>
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
            Enjoy your game
            <br />
            and chat with
            <br />
            your friends
          </h1>
          <p className="text-gray-400 max-w-lg mb-8">
            Lorem ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard.
          </p>
          <button
            className="text-black w-48 bg-gradient-to-r from-red-500 via-red-550 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-full text-sm px-5 py-2.5 text-center "
            onClick={() => {
              router.push("/login");
            }}
          >
            PLAY NOW
          </button>
        </div>

        {/* Team Section */}
        <section className="py-12">
          <h2 className="text-2xl font-bold mb-8">Our Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-zinc-900/80 p-6 rounded-lg flex flex-col items-center"
              >
                <Image
                  src={`${member.src}`}
                  alt={`${member.name} avatar`}
                  className="w-16 h-16 rounded-full mb-4"
                  width={64}
                  height={64}
                />
                <p className="text-gray-400 text-sm">{member.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Game Preview Section */}
        {/* <section className="py-12">
          <h2 className="text-2xl font-bold mb-8">Game Preview</h2>
          <div className="w-full aspect-video bg-zinc-900 rounded-lg"></div>
        </section> */}
      </main>
    </div>
  );
};

export default HomePage;
