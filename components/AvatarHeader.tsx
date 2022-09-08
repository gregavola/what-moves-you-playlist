import { signOut } from "next-auth/react";
import React from "react";
import ButtonPrimary from "./ButtonPrimary";
import { HelpCircle } from "react-feather";
import DialogFullScreen from "./DialogFullScreen";
import Type from "./Type";

export type AvatarHeaderProps = {
  imageUrl: string;
  username: string;
  includeLogout: boolean;
  baseUrl: string;
};

export default function AvatarHeader({
  includeLogout,
  baseUrl,
}: AvatarHeaderProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <React.Fragment>
      {isModalOpen && (
        <DialogFullScreen
          aria-label="Title"
          onClose={() => {
            setIsModalOpen(false);
          }}
          body={
            <div>
              <Type as="h3" variant="celloCanon">
                What is this data?
              </Type>
              <Type as="p" variant="ballad" className="mb-2">
                This data shows you all classes you have taken in the last 45
                days on Peloton that are a Running Class (outdoor workouts are
                included) or a Cycling Class. We do not include any rides or
                runs below 5 minutes or Scenic or Just Run/Rides. These
                activities either do have documented playlists (i.e are just
                radio) or not enough time data to make a decision about your
                output.
              </Type>
              <Type as="p" variant="ballad">
                When then determine your top output and what song was playing
                during that time slot, and thus showing your top 3 songs per
                class.
              </Type>
              <Type as="p" variant="ballad">
                Finally, we map songs on Peloton to Spotify to create a playlist
                for you! We do not store your Peloton login information, we only
                convert it to a session to make requests on your behalf (i.e to
                pull your data)
              </Type>
              <Type as="h3" variant="celloCanon" className="mt-3">
                Who created this?
              </Type>

              <Type as="p" variant="ballad">
                This project was created by Greg Avola (@gregavola). Please
                reach out if you have any questions on Twitter.
              </Type>
            </div>
          }
          dialogTitle="About This Data"
          footer={
            <div>
              <ButtonPrimary
                buttonSize="sm"
                onClick={() => {
                  setIsModalOpen(false);
                }}
              >
                Close
              </ButtonPrimary>
            </div>
          }
          id="dialogConfirmation"
        />
      )}

      <div className="d-flex align-items-center">
        {includeLogout && (
          <React.Fragment>
            <ButtonPrimary
              buttonSize="sm"
              className="me-3 no-outline"
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              <HelpCircle color={"#000"} />
            </ButtonPrimary>

            <ButtonPrimary
              buttonSize="sm"
              onClick={() => {
                signOut({
                  callbackUrl: `${baseUrl}/`,
                });
              }}
            >
              Logout
            </ButtonPrimary>
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
}
