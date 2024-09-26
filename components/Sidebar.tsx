"use client";

import React, { Fragment } from "react";
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
import Image from 'next/image'
import '@/styles/sidebar.css'


type Props = {};

const Sidebar = (props: Props) => {
  const [dropActive, setDropActive] = useState(false);

  const handleDrop = () => {
    setDropActive(!dropActive);
  };

  const routes = [
    {
      href: "/home",
      icon: <IoHome className="icon" />,
    },
    {
      href: "/chat",
      icon: <IoChatbubbleEllipses className="icon" />,
    },
    {
      href: "/game",
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
          <div className="sidebar-logo">
            <Image src="/logo.svg" alt="logo" width="100" height="100" />
          </div>
          {routes.map((route, index) => {
            return (
              <Link key={index} href={route.href}>
                {route.icon}
              </Link>
            );
          })}
        </div>
        <div className="logout">
          <IoLogOut className="icon" />
        </div>
      </div>
      <div className="sidebar-mobile"></div>
    </Fragment>
  );
};

export default Sidebar;
