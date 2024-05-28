import { WebRTCEndpoint } from "@fishjam-dev/ts-client";
import { VIDEO_TRACK_CONSTRAINTS } from "./ReplaceTrackWithDummyStream";
import { brain2Mock, heart2Mock } from "./MockComponent";
import { useRef, useState } from "react";
import { VideoPlayer } from "./VideoPlayer";

type Props = {
  webrtc: WebRTCEndpoint;
};

// todo
//  - remove stream from addTrack - it should only require track
//  - add track status to client: muted / active
//  - replace currentStream with stream from ts-client
export const MuteTrackTest = ({ webrtc }: Props) => {
  const remoteTracIdRef = useRef<string | null>(null);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>();
  const [trackId, setTrackId] = useState<string | null>();

  const addTrack = async (stream: MediaStream) => {
    const track = stream.getVideoTracks()[0];

    if (!track) throw Error("Stream doesn't have any track");

    remoteTracIdRef.current = await webrtc.addTrack(
      track,
      stream,
      { goodTrack: "camera" },
      { enabled: true, activeEncodings: ["l", "m", "h"], disabledEncodings: [] }
    );
    setTrackId(remoteTracIdRef.current);
    setCurrentStream(stream);
  };

  const replaceTrack = async (trackId: string | null, stream: MediaStream | null, track: MediaStreamTrack | null) => {
    if (!trackId) throw Error("Track id is null");

    await webrtc.replaceTrack(trackId, track);
    setCurrentStream(stream);
  };


  return <div style={{ display: "flex", flexDirection: "column" }}>
    <div>
      <div>trackId: {trackId}</div>
    </div>

    <div>
      <button disabled={!!currentStream || !!trackId} onClick={() => addTrack(brain2Mock.stream)}>Add brain</button>
      <button disabled={!!currentStream || !!trackId} onClick={() => addTrack(heart2Mock.stream)}>Add heart</button>
      <button
        onClick={() => replaceTrack(remoteTracIdRef.current, heart2Mock.stream, heart2Mock.stream.getVideoTracks()[0])}>Replace
        with heart
      </button>
      <button
        onClick={() => replaceTrack(remoteTracIdRef.current, brain2Mock.stream, brain2Mock.stream.getVideoTracks()[0])}>Replace
        with brain
      </button>
      <button onClick={() => replaceTrack(remoteTracIdRef.current, null, null)}>Replace with null</button>
    </div>

    <div>
      {currentStream && <VideoPlayer stream={currentStream} />}
    </div>
  </div>;
};
