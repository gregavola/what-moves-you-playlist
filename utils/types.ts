export interface WorkoutMeta {
  id: string;
  name: string;
  intructor: {
    name: string;
    image_url: string;
  };
  classTitle: string;
  duration: number;
  createdAt: number;
  status: string;
  output: {
    max: number;
    min: number;
  };
}

export interface PusherData {
  song: Song;
  percentage: number;
}

export interface Artist {
  artist_id: string;
  artist_name: string;
  name?: string;
  uri?: string;
}

export interface Album {
  id: string;
  image_url: string;
  name: string;
  images?: AlbumArtwork[];
}

export interface AlbumArtwork {
  height: number;
  url: string;
  width: string;
}

export interface Song {
  id: string;
  uri?: string;
  popularity?: number;
  name: string;
  artists: Artist[];
  album: Album;
  time_start?: number;
  time_start_pretty?: string;
  time_end?: number;
  time_end_pretty?: string;
}

export interface SpotifySong {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  time_start: number;
  time_start_pretty: string;
  time_end: number;
  time_end_pretty: number;
}

export interface SongMeta {
  song: Song;
  output: number;
}

export interface GraphData {
  time: {
    pretty: string;
    time_start: number;
    time_end: number;
  };
  pretty: string;
  output: number;
}

export interface PelotonSongData {
  workout: WorkoutMeta;
  topSongs: SongMeta[];
  outputGraph?: GraphData[];
}

export interface PelotonData {
  workouts: PelotonSongData[];
  uniqueSongs: Song[];
}

export interface User {
  accountId: string;
  accessToken?: string;
  refreshToken?: string;
  username?: string;
  spotifyPlaylistId?: string;
  expiresIn?: number;
  pelotonUserId?: string;
  pelotonCookie?: string;
  email?: string;
  name?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAuthResponse {
  status: string;
  error: string;
  errorCode: string;
  me?: any;
}
