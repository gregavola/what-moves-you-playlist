import React, { ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";

export type LayoutProps = {
  children: ReactNode;
  title: string;
  description: string;
};

export default function Layout({ title, description, children }: LayoutProps) {
  return (
    <React.Fragment>
      <Header title={title} description={description} />
      <div className="container pb-3">{children}</div>
    </React.Fragment>
  );
}
