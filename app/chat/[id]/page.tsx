"use client";

import { useParams } from "next/navigation";
import React, { useEffect } from "react";

type Props = {};

const page = (props: Props) => {
  const params = useParams<{ id: string }>();

  useEffect(() => {
    const conversations = document.querySelector("div .left");
    const sidebar = document.querySelector(".sidebar");
    conversations?.classList.add("isOpen");
    sidebar?.classList.add("isOpen");

    return () => {
      conversations?.classList.remove("isOpen");
      sidebar?.classList.remove("isOpen");
    };
  }, []);

  return (
    <>
      <div className="messages-wrraper">{params.id}</div>
    </>
  );
};

export default page;
