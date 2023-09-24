import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";

const Navbar = dynamic(() => import("@components/ui/common/navbar"), {
  noSSR: false,
});

const Footer = dynamic(() => import("@components/ui/common/footer"), {
  noSSR: false,
});

// const Notify = dynamic(() => import("@components/ui/common/notify"), {
//   noSSR: false,
// });

export default function BaseLayout({ children }) {
  const memoizedChildren = useMemo(() => children, [children]);

  return (
    <>
      <Head>
        <title>Esdeveniments</title>
        <meta name="description" content="Esdeveniments.cat" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="alternative"
          title="RSS Feed Esdeveniments.cat"
          type="application/rss+xml"
          href="/rss.xml"
        />
      </Head>
      <Navbar />
      {/* <Notify /> */}
      <div className="bg-whiteCorp mx-auto pb-18 sm:w-full md:w-full lg:w-3/4 xl:w-3/4 lg:mx-auto xl:mx-auto">
        <div className="max-w-full mx-auto px-0 sm:px-10 sm:max-w-[576px] md:px-20 md:max-w-[768px] lg:px-40 lg:max-w-[1024px]">
          {memoizedChildren}
        </div>
      </div>

      <Footer />
    </>
  );
}
