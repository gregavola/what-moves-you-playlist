import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getSession, signOut } from "next-auth/react";
import Layout from "../components/Layout";
import { addPeloton, checkUserAuth } from "../utils/http";
import Type from "../components/Type";
import LoadingIndicator from "../components/LoadingIndicator";
import HorizontalRule from "../components/HorizontalRule";
import Banner from "../components/Banner";
import ButtonPrimary from "../components/ButtonPrimary";
import FormGroup from "../components/FormGroup";
import LottieHelper from "../components/LottieLoader";

export async function getServerSideProps(ctx: any) {
  const session = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  return {
    props: {},
  };
}

export type PelotonCreds = {
  username: string;
  password: string;
};

const LinkPeloton = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isError, setIsError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pelotonFormData, setPelotonFormData] = useState<PelotonCreds>({
    username: "",
    password: "",
  });

  useEffect(() => {
    checkUserAuth()
      .then((data) => {
        if (data.status === "OK") {
          router.push("/dashboard");
        } else {
          setIsChecking(false);
          setIsError("An unknown error occured. Please try again.");
        }
      })
      .catch((err) => {
        if (err.response.data.errorCode === "notFound") {
          signOut({ callbackUrl: "/" });
        } else if (
          err.response.data.errorCode === "invalidPeloton" ||
          err.response.data.errorCode === "noPeloton"
        ) {
          setIsChecking(false);
        } else {
          setIsChecking(false);
          setIsError("An unknown error occured. Please try again.");
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout title="Peloton Account" description="Link your Peloton Account">
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center p-5">
        {isChecking && (
          <React.Fragment>
            <Type as="h1" variant="alto" className="mb-3 text-center">
              Checking For Peloton Account...
            </Type>

            <LottieHelper
              style={{ height: 250, width: 250, marginTop: 15 }}
              loop={true}
            />
          </React.Fragment>
        )}

        {!isChecking && (
          <React.Fragment>
            {isError && (
              <React.Fragment>
                <Banner colorSet="danger">{isError}</Banner>
                <HorizontalRule />
              </React.Fragment>
            )}

            <Type as="h1" variant="forte" className="mb-2">
              Link Peloton Account
            </Type>

            <Type as="p" variant="celloCanon" className="text-center mb-5">
              In order to grab your data from Peloton, please enter your login
              credentials for Peloton. Your username and password will not be
              stored with this service. It is only used exchange for a session
              token to make calls on your behalf.
            </Type>

            <div className="w-75">
              <FormGroup
                formType="text"
                labelText="Email / Username"
                onChange={(e: any) => {
                  setPelotonFormData({
                    ...pelotonFormData,
                    username: e.target.value,
                  });
                }}
              />

              <FormGroup
                labelText="Password"
                formType="password"
                onChange={(e: any) => {
                  setPelotonFormData({
                    ...pelotonFormData,
                    password: e.target.value,
                  });
                }}
              />
            </div>

            <HorizontalRule />

            {isSubmitting && <LoadingIndicator />}

            {!isSubmitting && (
              <ButtonPrimary
                buttonSize="lg"
                onClick={async () => {
                  setIsSubmitting(true);
                  setIsError("");
                  addPeloton({
                    username: pelotonFormData.username,
                    password: pelotonFormData.password,
                  })
                    .then(() => {
                      router.push("/dashboard");
                    })
                    .catch(() => {
                      setIsSubmitting(false);

                      setIsError(
                        "There an error linking your account. Please try again."
                      );
                    });
                }}
              >
                Link your Peloton Account
              </ButtonPrimary>
            )}
          </React.Fragment>
        )}
      </div>
    </Layout>
  );
};

export default LinkPeloton;
