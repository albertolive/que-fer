import { useEffect } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";

const Year: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/sitemap");
  }, []);

  return null;
};

export default Year;
