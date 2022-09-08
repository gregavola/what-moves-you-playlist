import React from "react";
import { getSession, signIn } from "next-auth/react";
import Image from "next/image";
import Layout from "../components/Layout";
import Type from "../components/Type";
import ButtonPrimary from "../components/ButtonPrimary";
import HorizontalRule from "../components/HorizontalRule";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpotify } from "@fortawesome/free-brands-svg-icons";

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
    <Layout
      title="What Moves You Playlist - Favorite Songs via Ouptut"
      description="A simple service that creates a Spotify playlist of songs that are playing during your highest ouptut on Peloton."
    >
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center p-5">
        <Image
          src="/logo.png"
          height="200"
          width="200"
          alt="What Moves You Logo"
        />

        <Type
          as="h1"
          variant="forte"
          className="mb-2 text-uppercase text-center"
          style={{ letterSpacing: 2 }}
        >
          💪 What Moves You Playlist 🎼
        </Type>

        <Type as="h5" variant="celloCanon" className="text-center mb-1 mt-3">
          We create a personal playlist based on your Peloton™ workouts, showing
          you songs that had your highest output during a ride or run. To get
          started, please login with your Spotify™ account.
        </Type>

        <HorizontalRule />

        <ButtonPrimary
          buttonSize="lg"
          className="btn-success d-flex align-items-center"
          onClick={() => {
            signIn("spotify", {
              callbackUrl: `${hostUrl}/api/authCallback`,
            });
          }}
        >
          <FontAwesomeIcon
            icon={faSpotify}
            height={25}
            width={25}
            className="me-2"
          />
          Login with Spotify
        </ButtonPrimary>

        <div className="mt-5 d-flex text-center text-muted justify-content-center">
          This site is not affilated with Spotify or Peloton Interactive. Made
          with 💜 by @<a href="https://twitter.com/gregavola">gregavola</a>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
