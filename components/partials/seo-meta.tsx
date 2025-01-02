import Head from "next/head";
import { siteUrl } from "@config/index";

const Meta = (props) => {
  let image = props.image
    ? props.image
    : `${siteUrl}/static/images/logo-seo-meta.webp`;

  return (
    <Head>
      <title>{props.title}</title>
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta
        name="robots"
        content={
          process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
            ? "noindex, nofollow"
            : "index, follow"
        }
      />
      <meta name="title" content={props.title} />
      <meta name="description" content={props.description} />
      <link rel="canonical" href={`${props.canonical}`} />
      <meta property="og:ttl" content="777600" />
      <meta property="og:type" content="website" />
      <meta name="og:title" property="og:title" content={props.title} />
      <meta
        name="og:description"
        property="og:description"
        content={props.description}
      />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={props.canonical} />
      <meta property="og:site_name" content="Esdeveniments.cat" />
      <meta property="og:locale" content="ca-ES" />
      <meta name="revisit-after" content="1 days" />
      <meta name="author" content="Esdeveniments.cat" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={props.title} />
      <meta name="twitter:description" content={props.description} />
      <meta name="twitter:site" content="@esdeveniments" />
      <meta name="twitter:creator" content="Esdeveniments.cat" />
      <meta name="twitter:url" content={props.canonical} />
      <meta name="twitter:domain" content={siteUrl} />
      <meta name="twitter:image:alt" content={props.title} />
      <meta property="fb:app_id" content="103738478742219" />
      <meta property="fb:pages" content="103738478742219" />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:src" content={image} />
      <meta
        name="google-site-verification"
        content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION}
      />
      <link rel="icon" type="image/png" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/favicon.ico" />
      <link rel="shortcut icon" href="/favicon.ico" />
      {props.preload && (
        <link
          rel="prefetch"
          href={props.preload}
          as="image"
          type="image/webp"
          crossOrigin="anonymous"
        />
      )}
    </Head>
  );
};
export default Meta;
