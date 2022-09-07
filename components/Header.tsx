import Head from "next/head";
import React from "react";

export type HeaderProps = {
  title: string;
  description?: string;
};

export default function Header({ title, description }: HeaderProps) {
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
      <link rel="icon" href="/favicon.ico" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap"
        rel="stylesheet"
      />
    </Head>
  );
}
