import React from "react";
import { getSession, signIn } from "next-auth/react";
import Layout from "../components/Layout";
import Type from "../components/Type";
import ButtonPrimary from "../components/ButtonPrimary";
import HorizontalRule from "../components/HorizontalRule";

export async function getServerSideProps(ctx: any) {
  const session = await getSession(ctx);

  if (session) {
    return {
      redirect: {
        permanent: false,
        destination: "/auth",
      },
    };
  }
  return {
    props: {
      hostUrl: process.env.NEXTAUTH_URL,
    },
  };
}

const Index = ({ hostUrl }: { hostUrl: string }) => {
  return (
    <Layout title="The Musical Ouptut" description="Musical Output">
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center p-5">
        <Type
          as="h1"
          variant="forte"
          className="mb-2 text-uppercase"
          style={{ letterSpacing: 2, fontSize: 50 }}
        >
          💪 What Drives You Playlist 🎼
        </Type>

        <Type as="h5" variant="celloCanon" className="text-center mb-3 mt-3">
          We create a personal playlist based on your Peloton workouts, showing
          you songs that had your highest output during a ride or run. To get
          started, please login with your Spotify account.
        </Type>

        <HorizontalRule />

        <ButtonPrimary
          buttonSize="lg"
          className="btn-success"
          onClick={() => {
            signIn("spotify", {
              callbackUrl: `${hostUrl}/api/callback`,
            });
          }}
        >
          Login with Spotify
        </ButtonPrimary>
      </div>

      <div className="d-flex text-center text-muted justify-content-center">
        This site is not affilated with Spotify or Peloton Interactive. Made
        with 💜 by @<a href="https://twitter.com/gregavola">gregavola</a>
      </div>
    </Layout>
  );
};

export default Index;
