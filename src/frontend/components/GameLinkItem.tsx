import React from "react";
import Link from "next/link";
import Image from "next/image";
import "@/styles/game-link-item.css"

type Props = {
    title: string;
    image: string;
    href: string;
    status: string;
};

const GameLinkItem = (props: Props) => {
  return (
    <div className='game-item'>
        <Link className="link" href={props.href}>
        <div className='title'>{props.title}</div>
        <div className="image-container">
          <Image 
                src={props.image} 
                alt={props.title} 
                width={100} 
                height={100} 
                style={{ objectFit: 'contain' }}
              />
        </div>
        </Link>
        <div className='status'>{props.status || "new"}</div>
    </div>
  );
};

export default GameLinkItem;
