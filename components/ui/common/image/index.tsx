import { useState, memo, useRef } from "react";
import NextImage from "next/image";
import dynamic from "next/dynamic";
import useOnScreen from "@components/hooks/useOnScreen";
import { env } from "@utils/helpers";
import { useNetworkSpeed } from "@components/hooks/useNetworkSpeed";

const ImgDefault = dynamic(() => import("@components/ui/imgDefault"), {
  loading: () => (
    <div className="flex justify-center items-center w-full">
      <div className="w-full h-60 bg-darkCorp animate-fast-pulse"></div>
    </div>
  ),
});

const cloudflareLoader = ({ src, width, quality = 70 }) => {
  return src;
  // if (!src) return "";
  // const normalizedSrc = src.startsWith("/") ? src.slice(1) : src;
  // const params = [`width=${width}`, `quality=${quality}`, "format=auto"];
  // const paramsString = params.join(",");

  // return env === "prod"
  //   ? `/cdn-cgi/image/${paramsString}/${normalizedSrc}`
  //   : src;
};

function ImageComponent({
  title,
  date,
  location,
  subLocation,
  image,
  className = "w-full h-full flex justify-center items-center",
  priority = false,
}) {
  const imgDefaultRef = useRef();
  const isImgDefaultVisible = useOnScreen(imgDefaultRef, {
    freezeOnceVisible: true,
  });
  const [hasError, setHasError] = useState(false);
  const imageClassName = `${className}`;
  const quality = useNetworkSpeed();

  if (!image || hasError) {
    return (
      <div className={imageClassName} ref={imgDefaultRef}>
        {isImgDefaultVisible ? (
          <ImgDefault
            title={title}
            date={date}
            location={location}
            subLocation={subLocation}
            alt={title}
          />
        ) : (
          <div className="flex justify-center items-center w-full">
            <div className="w-full h-60 bg-darkCorp animate-fast-pulse"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={imageClassName} style={{ position: "relative" }}>
      <NextImage
        className="object-cover"
        loader={({ src, width }) => cloudflareLoader({ src, width, quality })}
        src={image}
        alt={title}
        width={500}
        height={260}
        loading={priority ? "eager" : "lazy"}
        onError={() => setHasError(true)}
        quality={quality}
        style={{
          objectFit: "cover",
        }}
        priority={priority}
        sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 25vw"
        srcSet={`
          ${cloudflareLoader({ src: image, width: 480 })} 480w,
          ${cloudflareLoader({ src: image, width: 768 })} 768w,
          ${cloudflareLoader({ src: image, width: 1200 })} 1200w
        `}
        unoptimized={env === "dev"}
      />
    </div>
  );
}

export default memo(ImageComponent);
