import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "next-auth/react";
import { Play, List } from "react-feather";
import Layout from "../components/Layout";
import {
  PelotonData,
  PelotonQueueStatus,
  PelotonSongData,
  Song,
  SongMeta,
  User,
} from "../utils/types";
import {
  addPlaylist,
  beginMatching,
  checkAuthRefresh,
  createSpotiftyPlaylist,
  getPelotonData,
} from "../utils/http";
import { getAuthUser } from "../utils/getUserAuth";
import AvatarHeader from "../components/AvatarHeader";
import SongListItem from "../components/SongListItem";
import Moment from "react-moment";
import Image from "next/image";
import DialogFullScreen from "../components/DialogFullScreen";
import Banner from "../components/Banner";
import Type from "../components/Type";
import Progress from "../components/Progress";
import LoadingIndicator from "../components/LoadingIndicator";
import ButtonPrimary from "../components/ButtonPrimary";
import HorizontalRule from "../components/HorizontalRule";
import LottieLoader from "../components/LottieLoader";

export async function getServerSideProps(ctx: any) {
  const session = await getSession(ctx);

  if (session) {
    const userInfo = await getAuthUser(session.userId as string);

    if (!userInfo) {
      return {
        redirect: {
          permanent: false,
          destination: "/",
        },
      };
    }

    return {
      props: {
        userInfo: JSON.stringify(userInfo),
        baseUrl: process.env.NEXTAUTH_URL,
      },
    };
  }

  return {
    redirect: {
      permanent: false,
      destination: "/",
    },
  };
}

const Dashboard = ({
  userInfo,
  baseUrl,
}: {
  userInfo: string;
  baseUrl: string;
}) => {
  const userInfoJSON: User = JSON.parse(userInfo);

  // let pusher = null;

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isError, setIsError] = useState("");
  const [randomPromptQuestions, setRandomPromptQuestions] = useState(
    "Generating Data from Peloton..."
  );
  const [bannerText, setBannerText] = useState("");
  const [isCreatingSpotifyPlaylist, setIsCreatingSpotifyPlaylist] =
    useState(false);
  const [isMatchingComplete, setIsMatchingComplete] = useState(false);
  const [percentageComplete, setPercetageComplete] = useState(0);
  const [workerPerc, setWorkPerc] = useState(0);
  const [modalError, setModalError] = useState("");
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [pData, setPData] = useState<PelotonData>();
  const [spotifySongs, setSpotifySongs] = useState<Song[]>([]);

  const coolPrompts: Array<string> = [
    "We know it's taking a long time, but it's worth it. Just like you are 💜",
    "Geez, you workout alot! We have to crunch of all the data, and we are getting a workout doing it!",
    "This would be great, if it was going faster, but it's not. We're sorry 🤖",
    "It's 99% complete, but we all know the last 1% takes longer than the 99% - am I right",
  ];

  let intervalQuestion: any = null;

  const startRandomQuestions = () => {
    intervalQuestion = setInterval(() => {
      const randomItem =
        coolPrompts[Math.floor(Math.random() * coolPrompts.length)];
      setRandomPromptQuestions(randomItem);
    }, 5000);
  };

  const startPlaylist = async () => {
    setIsCreatingPlaylist(true);
    const playlistId = uuidv4();
    await addPlaylist({
      playlistId,
      songs: pData?.uniqueSongs,
    });

    // pusher = new Pusher('5ce1895723a9355bb626', {
    //   cluster: 'us2',
    // });

    // const channel = pusher.subscribe(`playlist-creator-${playlistId}`);

    // channel.bind('track-found', (data: PusherData) => {
    //   setPercetageComplete(data.percentage);
    // });

    setIsModalOpen(true);

    const intPerc = setInterval(() => {
      const tempInterval = percentageComplete + 10;
      setPercetageComplete(tempInterval);
    }, 2000);

    const matchingResponse = await beginMatching({ playlistId });
    setSpotifySongs(matchingResponse);
    setIsMatchingComplete(true);
    setIsCreatingPlaylist(false);
    setPercetageComplete(100);

    clearInterval(intPerc);

    // if (pusher) {
    //   pusher.disconnect();
    // }
  };

  const handlePolling = async () => {
    const pollingInterval = setInterval(async () => {
      getPelotonData()
        .then((data: PelotonData | PelotonQueueStatus) => {
          if ((data as PelotonData).workouts) {
            clearInterval(intervalQuestion);
            clearInterval(pollingInterval);
            setIsLoading(false);
            setPData(data as PelotonData);
            setWorkPerc(0);
          } else {
            setWorkPerc((data as PelotonQueueStatus).percentage);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }, 7000);
  };

  const handleRequest = async () => {
    setIsLoading(true);
    setIsError("");
    await checkAuthRefresh();

    startRandomQuestions();

    getPelotonData()
      .then((data: PelotonData | PelotonQueueStatus) => {
        if ((data as PelotonData).status === "NO_DATA") {
          setIsError(
            "You don't appear to have any workouts that would count during that last 45 days."
          );
        } else {
          if ((data as PelotonData).workouts) {
            setPData(data as PelotonData);
            setIsLoading(false);
            clearInterval(intervalQuestion);
          } else {
            handlePolling();
          }
        }
      })
      .catch(() => {
        clearInterval(intervalQuestion);
        setIsLoading(false);
        setIsError(
          "There was an problem grabbing your data. Please try again."
        );
      });
  };

  const handleCloser = () => {
    setIsModalOpen(false);
    setModalError("");
    setSpotifySongs([]);
    setPercetageComplete(0);
    // if (pusher) {
    //   pusher.disconnect();
    // }
  };

  useEffect(() => {
    handleRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout
      title="The Musical Ouptut - Workouts and Music"
      description="Your workouts and music a listed in one spot"
    >
      {isModalOpen && (
        <DialogFullScreen
          onClose={() => {
            handleCloser();
          }}
          dialogTitle="What Moves You Playlist"
          id="default"
          body={
            <React.Fragment>
              {modalError && (
                <div className="m-3">
                  <Banner colorSet="danger">{modalError}</Banner>
                </div>
              )}
              <Type as="p" style={{ textAlign: "center" }} variant="balladBold">
                {isMatchingComplete
                  ? "Songs for Playlist"
                  : "Matching Songs..."}
              </Type>
              {isMatchingComplete && (
                <Type as="p" variant="viola" className="mb-3 text-center">
                  {spotifySongs.length} Songs
                </Type>
              )}
              <div className="container">
                {percentageComplete !== 100 && (
                  <div className="d-flex align-items-center mt-3">
                    <Progress value={percentageComplete} className="w-100" />

                    <Type as="p" variant="cello" className="ms-3">
                      {Math.round(percentageComplete)}%
                    </Type>
                  </div>
                )}
                {!isMatchingComplete && (
                  <div className="d-flex justify-content-center mt-5">
                    <LoadingIndicator />
                  </div>
                )}

                {spotifySongs && (
                  <React.Fragment>
                    {spotifySongs.map((item: Song) => {
                      return (
                        <div className="mb-3" key={item.uri}>
                          <SongListItem song={item} />
                        </div>
                      );
                    })}
                  </React.Fragment>
                )}
              </div>
            </React.Fragment>
          }
          footer={
            <>
              {isCreatingSpotifyPlaylist && (
                <div className="d-flex justify-content-center w-100">
                  <LoadingIndicator />
                </div>
              )}
              {!isCreatingSpotifyPlaylist && !isLoading && (
                <>
                  {isMatchingComplete && (
                    <React.Fragment>
                      <ButtonPrimary
                        buttonSize="lg"
                        onClick={() => {
                          handleCloser();
                        }}
                      >
                        Close
                      </ButtonPrimary>
                      <ButtonPrimary
                        buttonSize="lg"
                        onClick={async () => {
                          if (!spotifySongs || spotifySongs.length === 0) {
                            setModalError(
                              "There was an error creating your playlist."
                            );
                          } else {
                            // if (pusher) {
                            //   pusher.disconnect();
                            // }

                            setModalError("");
                            setIsCreatingSpotifyPlaylist(true);
                            const trackIds: Array<string | undefined> =
                              spotifySongs.map((item: Song) => {
                                return item.uri;
                              });

                            if (!trackIds) {
                              setModalError(
                                "There was an error creating your playlist."
                              );
                            } else {
                              createSpotiftyPlaylist({ trackIds })
                                .then(() => {
                                  setIsModalOpen(false);
                                  setIsCreatingSpotifyPlaylist(false);
                                  setBannerText(
                                    "Great! Your playlist has been created!"
                                  );
                                  setTimeout(() => {
                                    setBannerText("");
                                  }, 3000);
                                })
                                .catch(() => {
                                  setIsCreatingSpotifyPlaylist(false);
                                  setModalError(
                                    "There was an error creating your playlist."
                                  );
                                });
                            }
                          }
                        }}
                      >
                        <List className="me-2" />
                        Create Playlist
                      </ButtonPrimary>
                    </React.Fragment>
                  )}
                </>
              )}
            </>
          }
        />
      )}
      <div>
        {isError && (
          <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center p-5">
            <Banner colorSet="danger" className="mb-3">
              {isError}
            </Banner>
            <ButtonPrimary
              buttonSize="lg"
              onClick={() => {
                handleRequest();
              }}
            >
              Retry
            </ButtonPrimary>
          </div>
        )}
        {bannerText && <Banner colorSet="success">{bannerText}</Banner>}
        {!isLoading && (
          <div className="d-flex justify-content-between align-items-center mt-5">
            <Type as="h1" variant="alto">
              Workouts & Music 💪
            </Type>
            <AvatarHeader
              username={userInfoJSON.username || ""}
              imageUrl={userInfoJSON.avatar || ""}
              includeLogout
              baseUrl={baseUrl}
            />
          </div>
        )}

        {isLoading && (
          <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center p-5">
            <Type as="h1" variant="alto" className="mb-3 text-center">
              {randomPromptQuestions}
            </Type>
            {workerPerc !== 0 && (
              <div className="d-flex align-items-center mt-3 mb-3 w-100">
                <Progress
                  value={workerPerc}
                  className="w-100"
                  animated={true}
                  striped={true}
                  variant={workerPerc > 80 ? "success" : "info"}
                />
              </div>
            )}
            <LottieLoader
              style={{ height: 250, width: 250, marginTop: 15 }}
              loop={true}
            />
          </div>
        )}

        <HorizontalRule />
      </div>
      <div className="pb-5">
        {!isLoading && pData && (
          <React.Fragment>
            {pData.workouts.map((item: PelotonSongData) => {
              return (
                <div key={item.workout.id}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div className="image me-3">
                        <Image
                          src={item.workout.intructor.image_url}
                          height="50"
                          alt={item.workout.intructor.name}
                          width="50"
                          style={{ borderRadius: 25 }}
                        />
                      </div>
                      <div className="meta me-3">
                        <Type as="h5" variant="cello" className="mb-0">
                          {item.workout.classTitle}
                        </Type>

                        <Type as="h6" variant="ballad">
                          {item.workout.intructor.name} ·{" "}
                          <Type as="span" variant="ballad">
                            {item.workout.name}
                          </Type>
                        </Type>

                        <Type as="p" variant="viola" className="text-muted">
                          <Moment format="lll">
                            {item.workout.createdAt * 1000}
                          </Moment>
                        </Type>
                      </div>
                    </div>
                    <div className="output-range d-flex justify-content-center align-items-center">
                      <div>
                        <Type
                          as="h5"
                          variant="cello"
                          className="text-center text-uppercase"
                        >
                          Range
                        </Type>
                        <div className="d-flex align-items-center">
                          <Type
                            as="h3"
                            variant="celloCanon"
                            className="text-center mb-0"
                          >
                            {item.workout.output.min} -{" "}
                            {item.workout.output.max}
                          </Type>
                          <Type as="p" variant="viola" className="ms-1 mb-0">
                            kj
                          </Type>
                        </div>
                      </div>
                    </div>
                  </div>

                  <HorizontalRule />

                  <Type
                    as="h5"
                    variant="balladBold"
                    className="mb-3 text-uppercase"
                  >
                    Highest Output Songs
                  </Type>
                  {item.topSongs.map((songItem: SongMeta) => {
                    return (
                      <div
                        key={`${item.workout.id}-${songItem.song.id}`}
                        className="d-flex align-items-center justify-content-between mb-3 ps-3 pe-3"
                      >
                        <SongListItem song={songItem.song} />
                        <div className="output-value d-flex align-items-center">
                          <Type
                            as="h1"
                            variant="celloCanon"
                            className="mb-0 text-center"
                          >
                            {songItem.output}
                          </Type>
                          <Type as="p" variant="viola" className="ms-1 mb-0">
                            kj
                          </Type>
                        </div>
                      </div>
                    );
                  })}

                  <HorizontalRule />
                </div>
              );
            })}
          </React.Fragment>
        )}
      </div>

      {!isLoading && (
        <div className="floatingFooter">
          <div className="d-flex justify-content-center mt-3 mb-3">
            {!isCreatingPlaylist ? (
              <ButtonPrimary
                buttonSize="lg"
                className="d-flex align-items-center"
                onClick={() => {
                  startPlaylist();
                }}
              >
                <Play className="me-1" />
                Create Playlist
              </ButtonPrimary>
            ) : (
              <LoadingIndicator />
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
