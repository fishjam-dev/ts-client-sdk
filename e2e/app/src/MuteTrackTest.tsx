import { WebRTCEndpoint } from "@fishjam-dev/ts-client";
import { brain2Mock, heart2Mock } from "./MockComponent";
import { useEffect, useState } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { WebRTCEndpointEvents } from "../../../src";
import { EndpointMetadata, TrackMetadata } from "./App";

type Props = {
  webrtc: WebRTCEndpoint;
};


// todo
//  - add track status to client: muted / active - X
export const MuteTrackTest = ({ webrtc }: Props) => {
  const [currentStream, setCurrentStream] = useState<MediaStream | null>();
  const [trackId, setTrackId] = useState<string | null>(null);

  useEffect(() => {
    const handler: WebRTCEndpointEvents<EndpointMetadata, TrackMetadata>["localTrackAdded"] = (event) => {
      setCurrentStream(event.stream);
      setTrackId(event.trackId);
    };

    webrtc.on("localTrackAdded", handler);

    return () => {
      webrtc.removeListener("localTrackAdded", handler);
    };
  }, []);

  const addTrack = async (stream: MediaStream) => {
    const track = stream.getVideoTracks()[0];

    if (!track) throw Error("Stream doesn't have any track");

    await webrtc.addTrack(
      track,
      { goodTrack: "camera" },
      { enabled: true, activeEncodings: ["l", "m", "h"], disabledEncodings: [] }
    );
  };

  const replaceTrack = async (trackId: string | null, stream: MediaStream | null, track: MediaStreamTrack | null) => {
    if (!trackId) throw Error("Track id is null");

    await webrtc.replaceTrack(trackId, track);
  };


  return <div style={{ display: "flex", flexDirection: "column" }}>
    <div>
      <div>trackId: {trackId}</div>
    </div>

    <div>
      <button disabled={!!currentStream || !!trackId} onClick={() => addTrack(heart2Mock.stream)}>Add heart</button>
      <button disabled={!!currentStream || !!trackId} onClick={() => addTrack(brain2Mock.stream)}>Add brain</button>
      <button
        onClick={() => replaceTrack(trackId, heart2Mock.stream, heart2Mock.stream.getVideoTracks()[0])}>
        Replace with heart
      </button>
      <button
        onClick={() => replaceTrack(trackId, brain2Mock.stream, brain2Mock.stream.getVideoTracks()[0])}>
        Replace with brain
      </button>
      <button onClick={() => replaceTrack(trackId, null, null)}>Mute track</button>
    </div>

    <div>
      {currentStream && <VideoPlayer stream={currentStream} />}
    </div>
  </div>;
};
