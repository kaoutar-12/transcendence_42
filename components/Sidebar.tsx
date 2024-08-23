import React from "react";
import Link from "next/link";
import { IoHome } from "react-icons/io5";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { IoGameController } from "react-icons/io5";
import { IoPeople } from "react-icons/io5";
import { IoEllipsisVerticalCircleSharp } from "react-icons/io5";

type Props = {};

const Sidebar = (props: Props) => {
  const routes = [
    {
      href: "#",
      icon: <IoHome className="icon" />,
    },
    {
      href: "#",
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
      <Link href="#" >
        <IoEllipsisVerticalCircleSharp className="icon icon-setting"/>
      </Link>
    </div>
  );
};

export default Sidebar;
