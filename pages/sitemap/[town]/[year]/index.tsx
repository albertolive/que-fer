import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Year() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/sitemap");
  });

  return null;
}
