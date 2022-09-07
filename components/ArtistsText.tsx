import React from "react";
import { Artist } from "../utils/types";
import Type from "./Type";

export default function ArtistsText({ artists }: { artists: Artist[] }) {
  const artistsCleanMap = artists.map((item: Artist) => {
    return item.name || item.artist_name;
  });

  return (
    <Type as="span" variant="ballad" className="text-muted">
      {artistsCleanMap.join(", ")}
    </Type>
  );
}
