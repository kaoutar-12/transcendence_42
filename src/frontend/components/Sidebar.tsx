"use client";

import React, { Fragment, useEffect } from "react";
import Link from "next/link";
import { IoHome } from "react-icons/io5";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { IoGameController } from "react-icons/io5";
import { IoPeople } from "react-icons/io5";
import { IoEllipsisVerticalCircleSharp } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import { IoPersonCircle } from "react-icons/io5";
import { IoLogIn } from "react-icons/io5";
import { MdOutlineEqualizer } from "react-icons/md";
import { IoLogOut } from "react-icons/io5";
import { useState } from "react";
import Image from "next/image";
import "@/styles/sidebar.css";
import { usePathname, useRouter } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import { useWebSocket } from "./context/useWebsocket";

type Props = {};

const Sidebar = (props: Props) => {
  const pathname = usePathname();
  const { unreadCounts } = useWebSocket();
  const router = useRouter();
  const excludedPaths = [
    "/home",
    "/chat",
    "/games",
    "/settings",
    "/leaderboard",
    "/search",
  ];

  const shouldHideSidebar = !excludedPaths.some(
    (path) =>
      pathname.startsWith(path) &&
      (pathname.length === path.length || pathname[path.length] === "/")
  );

  const totalUnread = Object.entries(unreadCounts).reduce(
    (total, [roomId, count]) => {
      const isCurrentRoom = pathname.includes(roomId);
      return isCurrentRoom ? total : total + count;
    },
    0
  );

  if (shouldHideSidebar) {
    return null;
  }

  const routes = [
    {
      href: "/home",
      icon: <IoHome className="icon" />,
    },
    {
      href: "/chat",
      icon: (
        <div className="badge-container">
          <IoChatbubbleEllipses className="icon" />
          {totalUnread > 0 && (
            <span className="notification-badge">{totalUnread}</span>
          )}
        </div>
      ),
    },
    {
      href: "/games",
      icon: <IoGameController className="icon" />,
    },
    {
      href: "/settings",
      icon: <IoSettingsSharp className="icon" />,
    },
    {
      href: "/leaderboard",
      icon: <MdOutlineEqualizer className="icon" />,
    },
  ];

  return (
    <Fragment>
      <div className="sidebar">
        <div className="icons">
          <div
            className="sidebar-logo"
            onClick={() => {
              router.push("/home");
            }}
          >
            <Image
              src="/logo.webp"
              alt="logo"
              width="100"
              height="100"
              priority
            />
          </div>
          {routes.map((route, index) => {
            const isActive = pathname.startsWith(route.href);
            return (
              <Link
                key={index}
                href={route.href}
                className="icon"
                style={{
                  color: isActive ? "white" : " #bb151f",
                  transform: isActive ? "scale(1.2)" : "",
                }}
              >
                {route.icon}
              </Link>
            );
          })}
        </div>
        <div className="logout">
          <LogoutButton />
        </div>
      </div>
    </Fragment>
  );
};

export default Sidebar;
