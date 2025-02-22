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
import InviteToast from "./InviteToast";
import { toast } from "react-toastify";

type Props = {};

const Sidebar = (props: Props) => {
  const pathname = usePathname();
  const { unreadCounts, on, off, send } = useWebSocket();
  const router = useRouter();
  const excludedPaths = [
    "/home",
    "/chat",
    "/games",
    "/settings",
    "/leaderboard",
    "/search",
    "/profile",
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

  const handleAccept = (inviteId: number) => {
    console.log("Invite accepted:", inviteId);
    send(JSON.stringify({ type: "accept_invite", invite_id: inviteId }));
    toast.dismiss(); // Close the toast after accepting
    // Add your logic here for accepting the invite
  };

  const handleDecline = (inviteId: number) => {
    send(JSON.stringify({ type: "decline_invite", invite_id: inviteId }));
    toast.dismiss();
  };

  useEffect(() => {
    const handleInvite = (data: any) => {
      const { from_username, invite_id } = data;
      toast(
        <InviteToast
          from_username={from_username}
          onAccept={() => handleAccept(invite_id)}
          onDecline={() => handleDecline(invite_id)}
        />,
        {
          autoClose: false, // Prevents the toast from closing automatically
          closeOnClick: false, // Prevents closing the toast when clicking on it
        }
      );
    };

    const handleCreateGame = (data: any) => {
      const { game_id } = data;
      const toastId = toast.info(
        <div>
          <strong>Game Created!</strong>
          <br />
          Redirecting to Game ID: {game_id}...
        </div>,
        {
          theme: "colored",
          hideProgressBar: true,
          onClose: () => {
            setTimeout(() => {
              router.push(`/games/pingpong/1-vs-1/${game_id}`);
            }, 100);
          },
        }
      );

      setTimeout(() => toast.dismiss(toastId), 3500);
    };

    const handleGameDeclined = (data: any) => {
      const { by_username, invite_id } = data;
      const toastId = toast.error(
        <div>
          <strong>Game Declined by {by_username}</strong>
        </div>,
        {
          hideProgressBar: true,
        }
      );

      setTimeout(() => toast.dismiss(toastId), 2500);
    };

    on("invite_received", handleInvite);
    on("game_created", handleCreateGame);
    on("invite_declined", handleGameDeclined);

    return () => {
      off("invite_received");
      off("game_created");
      off("invite_declined");
    };
  }, [on, off]);

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
    <div className="h-full fixed z-50 w-[120px] border border-red-800">
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
    </div>
  );
};

export default Sidebar;
