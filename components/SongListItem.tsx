import React from "react";
import { Song } from "../utils/types";
import ArtistsText from "./ArtistsText";
import Type from "./Type";

export type SongItemProps = {
  song: Song;
};

export default function SongListItem({ song }: SongItemProps) {
  return (
    <div className="meta-wrapper d-flex align-items-center">
      <div className="avatar me-3">
        {song.album.images ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={song.album.name}
            src={song.album.images[0].url}
            height={50}
            width={50}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={song.album.name}
            src={song.album.image_url}
            height={50}
            width={50}
          />
        )}
      </div>
      <div className="meta">
        <Type as="h5" className="mb-0" variant="balladBold">
          {song.name}
        </Type>
        <ArtistsText artists={song.artists} />
        {song.time_start_pretty && song.time_end_pretty && (
          <Type as="h6" variant="viola" className="text-muted">
            {song.time_start_pretty} - {song.time_end_pretty}
          </Type>
        )}
      </div>
    </div>
  );
}
