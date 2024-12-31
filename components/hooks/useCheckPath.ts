import { useRouter } from "next/router";

export const useCheckPath = () => {
  const { asPath } = useRouter();

  // Define the paths that should return true
  const truePaths = ["/", "/[place]", "/[place]/[byDate]"];

  // Define the paths that should return false
  const falsePaths = [
    "/publica",
    "/qui-som",
    "/e/",
    "/sitemap",
    "/sitemap/[town]",
    "/sitemap/[town]/[year]",
    "/sitemap/[town]/[year]/[month]",
  ];

  // Check if the current path matches any of the true paths
  const isTruePath = truePaths.some((path) => asPath.startsWith(path));

  // Check if the current path matches any of the false paths
  const isFalsePath = falsePaths.some((path) => asPath.startsWith(path));

  // Return true if the current path matches a true path and does not match a false path
  // Otherwise, return false
  return isTruePath && !isFalsePath;
};
