import Conversations from "@/components/Conversations";
import React, { Fragment } from "react";

type Props = {
  children: React.ReactNode;
};

const layout = (props: Props) => {
  return (
    <Fragment>
      {/* <div className="chat"> */}
        <Conversations />
        {props.children}
      {/* </div> */}
    </Fragment>
  );
};

export default layout;
