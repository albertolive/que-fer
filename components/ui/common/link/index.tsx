import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function ActiveLink({ children, activeLinkClass, ...props }) {
  const { pathname } = useRouter();
  let className =
    children.props.className ||
    "flex justify-center items-center gap-2 text-blackCorp bg-whiteCorp py-2 px-3 font-barlow italic uppercase font-medium tracking-wider ease-in-out duration-200";

  if (pathname === props.href)
    className = `${
      activeLinkClass
        ? activeLinkClass
        : "text-primary bg-whiteCorp border-b-2 border-primary ease-in-out duration-200"
    } ${className}`;

  return (
    <Link {...props} prefetch={false} legacyBehavior>
      {React.cloneElement(children, { className })}
    </Link>
  );
}
