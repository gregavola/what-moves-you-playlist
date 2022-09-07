import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import React from "react";

function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default App;
