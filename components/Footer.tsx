import React from "react";

export default function Footer() {
  const copyrightYear = new Date().getFullYear();
  return <div>{copyrightYear}</div>;
}
