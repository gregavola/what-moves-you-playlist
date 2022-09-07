import axios from "axios";
import {
  PelotonData,
  PelotonQueueStatus,
  Song,
  UserAuthResponse,
} from "./types";

export function checkUserAuth(): Promise<UserAuthResponse> {
  return axios.get(`/api/authCheck`).then((response) => {
    return response.data;
  });
}

export function getPelotonData(): Promise<PelotonData | PelotonQueueStatus> {
  return axios.post("/api/peloton").then((response) => {
    return response.data;
  });
}

export function addPeloton({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<any> {
  return axios
    .post("/api/peloton/auth", {
      username,
      password,
    })
    .then((response) => {
      return response.data;
    });
}

export function addPlaylist({
  playlistId,
  songs,
}: {
  playlistId: string;
  songs: Song[] | undefined;
}): Promise<any> {
  return axios
    .post(`/api/playlist?playlistId=${playlistId}`, {
      songs,
    })
    .then((response) => {
      return response.data;
    });
}

export function createSpotiftyPlaylist({
  trackIds,
}: {
  trackIds: Array<string | undefined>;
}): Promise<any> {
  return axios
    .post(`/api/spotify/playlist/create`, {
      trackIds,
    })
    .then((response) => {
      return response.data;
    });
}

export function apiCreateSpotifyPlaylist({
  userId,
  name,
}: {
  userId: string;
  name: string;
}): Promise<any> {
  return axios
    .post(`/api/spotify/playlist/apiCreate`, {
      userId,
      name,
    })
    .then((response) => {
      return response.data;
    });
}

export function beginMatching({
  playlistId,
}: {
  playlistId: string;
}): Promise<any> {
  return axios
    .post(`/api/spotify/search?playlistId=${playlistId}`)
    .then((response) => {
      return response.data;
    });
}

export function checkAuthRefresh(): Promise<any> {
  return axios.post("/api/spotify/auth").then((response) => {
    return response.data;
  });
}
