import { Helmet } from "react-helmet-async";

const DEFAULTS = {
  siteName: "Ecom Store",
  title: "Ecom Store – Buy Electronics Online",
  description:
    "Shop electronics, mobiles, and accessories online at best prices with fast delivery.",
  url: "https://ecomstore.com",
  image: "https://ecomstore.com/og-default.jpg",
  twitterHandle: "@ecomstore",
};

const SEO = ({
  title,
  description,
  canonical,
  image,
  type = "website",
  noIndex = false,
}) => {
  const seoTitle = title
    ? `${title} | ${DEFAULTS.siteName}`
    : DEFAULTS.title;

  const seoDescription = description || DEFAULTS.description;
  const seoImage = image || DEFAULTS.image;
  const seoUrl = canonical || DEFAULTS.url;

  return (
    <Helmet>
      {/* Primary Meta */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />

      {/* Indexing */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical */}
      <link rel="canonical" href={seoUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={DEFAULTS.siteName} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:image" content={seoImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={DEFAULTS.twitterHandle} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
    </Helmet>
  );
};

export default SEO;