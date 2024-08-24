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
import { useState } from "react";

type Props = {};

const Sidebar = (props: Props) => {
  const [dropActive, setDropActive] = useState(false);

  const handleDrop = () => {
    setDropActive(!dropActive);
  };

  const routes = [
    {
      href: "#",
      icon: <IoHome className="icon" />,
    },
    {
      href: "/chat",
      icon: <IoChatbubbleEllipses className="icon" />,
    },
    {
      href: "#",
      icon: <IoGameController className="icon" />,
    },
    {
      href: "#",
      icon: <IoPeople className="icon" />,
    },
  ];

  return (
    <Fragment>
      <div className="sidebar">
        <div className="icons">
          <div className="sidebar-logo">LOGO</div>
          {routes.map((route, index) => {
            return (
              <Link key={index} href={route.href}>
                {route.icon}
              </Link>
            );
          })}
        </div>
        <Link href="#" onClick={handleDrop}>
          <IoEllipsisVerticalCircleSharp className="icon icon-setting" />
        </Link>
      </div>
      {dropActive && (
        <div className="drop">
          <Link href="#">
            {" "}
            <IoPersonCircle className="icon-drop"/>
          </Link>
          <Link href="#">
            {" "}
            <IoSettingsSharp className="icon-drop"/>
          </Link>
          <Link href="#">
            {" "}
            <IoLogIn className="icon-drop" />{" "}
          </Link>
        </div>
      )}
    </Fragment>
  );
};

export default Sidebar;
