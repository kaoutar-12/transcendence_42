"use client";

import React, { useEffect } from "react";

type Props = {};

const page = (props: Props) => {
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
      <div>page</div>
    </>
  );
};

export default page;
