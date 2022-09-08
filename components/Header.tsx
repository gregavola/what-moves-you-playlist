/* eslint-disable @next/next/no-page-custom-font */
import Head from "next/head";
import React from "react";
import { useRouter } from "next/router";

export type HeaderProps = {
  title: string;
  description?: string;
};

export default function Header({ title, description }: HeaderProps) {
  const canonicalURL = useRouter().pathname;

  return (
    <Head>
      <title>{title}</title>
      <meta
        name="description"
        content={
          description ||
          "A customized playlist based on your workouts on Peloton"
        }
      />

      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/favicon/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon/favicon-16x16.png"
      />
      <link rel="manifest" href="/favicon/site.webmanifest" />
      <link
        rel="mask-icon"
        href="/favicon/safari-pinned-tab.svg"
        color="#5bbad5"
      />
      <meta name="msapplication-TileColor" content="#da532c" />
      <meta name="theme-color" content="#ffffff" />

      <meta name="twitter:card" content="summary_large_image" />

      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta
        name="twitter:url"
        content={`https://whatmovesyouplaylist.com${canonicalURL}`}
      />
      <meta name="twitter:image" content="/public/tw-og-v2.png" />

      <meta property="og:title" content={title} />
      <meta property="og:site_name" content={title} />
      <meta
        property="og:url"
        content={`https://whatmovesyouplaylist.com${canonicalURL}`}
      />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="/public/fb-og-v2.png" />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap"
        rel="stylesheet"
      />
    </Head>
  );
}
