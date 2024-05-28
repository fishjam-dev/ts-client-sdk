import { VideoPlayer } from "./VideoPlayer";
import { useRef, useState } from "react";
import { WebRTCEndpoint } from "@fishjam-dev/ts-client";

/* eslint-disable no-console */

/*
 * Looks like Jellyfish handles track without simulcast properly
 *
 *  Case oszczędzania bandwithu
 *  - użytkownik ma słaby upload, wyłącza kamerę żeby mieć więcej seici na mikrofon
 *  - poprzednio zaobserwowaliśmy, że jest dużo padding pakietów albo czarnych ramek
 *  https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpSender/setParameters
 *  - jak tworzymy tracka to z sendera można pobrać tracki i ich settingsy i potem
 * na parametrach konkretne encodingi ustawić, trzeba sprawdzić, czy da sie zrobić takie encodingsy
 * dla canvasa jak są dla kamerki czyli 3 warstwy encodingóws
 */

export const VIDEO_TRACK_CONSTRAINTS: MediaTrackConstraints = {
  width: {
    max: 1280,
    ideal: 1280,
    min: 640,
  },
  height: {
    max: 720,
    ideal: 720,
    min: 320,
  },
  frameRate: {
    max: 30,
    ideal: 24,
  },
};

type Props = {
  webrtc: WebRTCEndpoint;
};

const createDummyStream = (
  width: number = 1280,
  height: number = 720,
): {
  stream: MediaStream;
  track: MediaStreamTrack;
} => {
  const canvas = document.createElement("canvas");
  canvas.height = height;
  canvas.width = width;
  const context = canvas.getContext("2d");

  if (!context) throw Error("Canvas context is null");

  context.fillRect(0, 0, width, height);

  const stream = canvas.captureStream();

  const track = stream.getVideoTracks()[0];

  if (!track) throw Error("Canvas track is null");

  track.enabled = false;

  return { stream, track };
};

export const ReplaceTrackWithDummyStream = ({ webrtc }: Props) => {
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoStreamIdRef = useRef<string | null>(null);
  const [simulcastCheckbox, setSimulcastCheckbox] = useState<boolean>(true);

  const startAndAddCamera = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: VIDEO_TRACK_CONSTRAINTS, audio: false });
    console.log({
      mediaStream,
      settings: mediaStream.getVideoTracks()[0].getSettings(),
      tracks: videoStream?.getVideoTracks(),
    });

    setVideoStream(mediaStream);

    const track = mediaStream.getVideoTracks()[0];

    if (videoStreamIdRef.current) {
      console.log("Replacing with camera");

      webrtc.replaceTrack(videoStreamIdRef.current, track, undefined, "unmute");
    } else {
      console.log("Adding track");

      videoStreamIdRef.current = await webrtc.addTrack(
        track,
        { goodTrack: "camera" },
        simulcastCheckbox
          ? {
              enabled: true,
              activeEncodings: ["l", "m", "h"],
              disabledEncodings: [],
            }
          : undefined,
      );
    }
  };

  const stopCameraAndReplaceWithNull = () => {
    videoStream?.getTracks().forEach((track) => {
      track.stop();
    });

    console.log("replacing with null", videoStreamIdRef.current);

    if (videoStreamIdRef.current) {
      webrtc.replaceTrack(videoStreamIdRef.current, null, { goodTrack: "null" }, "mute");
    }
  };

  const startCamera = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: VIDEO_TRACK_CONSTRAINTS, audio: false });
    console.log({
      mediaStream,
      settings: mediaStream.getVideoTracks()[0].getSettings(),
      tracks: videoStream?.getVideoTracks(),
    });
    setVideoStream(mediaStream);
  };

  const stopCamera = () => {
    videoStream?.getTracks().forEach((track) => {
      track.stop();
    });
  };

  const addCameraTrack = async () => {
    if (!videoStream) throw Error("Video stream is null");
    const track = videoStream.getVideoTracks()[0];

    videoStreamIdRef.current = await webrtc.addTrack(
      track,
      { source: "camera" },
      simulcastCheckbox
        ? {
            enabled: true,
            activeEncodings: ["l", "m", "h"],
            disabledEncodings: [],
          }
        : undefined,
    );
  };

  const toggleEnableCamera = () => {
    if (!videoStream) throw Error("Video stream is null");
    const track = videoStream.getVideoTracks()[0];
    const prevState = track.enabled;

    videoStream.getVideoTracks().forEach((track) => {
      track.enabled = !prevState;
    });
  };

  const removeCameraTrack = () => {
    if (!videoStreamIdRef.current) throw Error("Track id is null");

    webrtc.removeTrack(videoStreamIdRef.current);
  };

  const replaceWithDummyStaticStream = () => {
    if (!videoStreamIdRef.current) throw Error("Track id is null");

    const { track } = createDummyStream();
    webrtc.replaceTrack(videoStreamIdRef.current, track, { source: "dummy" });
  };

  const replaceWithCamera = () => {
    if (!videoStreamIdRef.current) throw Error("Track id is null");

    const track = videoStream?.getVideoTracks()[0];

    if (!track) throw Error("Track is null");

    webrtc.replaceTrack(videoStreamIdRef.current, track, { source: "camera" });
  };

  const replaceWithNull = () => {
    if (!videoStreamIdRef.current) throw Error("Track id is null");

    webrtc.replaceTrack(videoStreamIdRef.current, null, { source: "null" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div>
        <label htmlFor="simulcast">Simulcast?</label>
        <input
          checked={simulcastCheckbox}
          type="checkbox"
          id="simulcast"
          onChange={() => setSimulcastCheckbox(!simulcastCheckbox)}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "8px",
          borderStyle: "dashed",
          borderColor: "blue",
          borderWidth: "2px",
        }}
      >
        <button onClick={startAndAddCamera}>Start and add camera track</button>
        <button onClick={stopCameraAndReplaceWithNull}>Stop camera and replace with null</button>
      </div>

      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "8px" }}>
        <button onClick={startCamera}>Start a camera</button>
        <button onClick={addCameraTrack}>Add a camera track</button>
        <button onClick={toggleEnableCamera}>Toggle a camera track</button>
        <button onClick={replaceWithDummyStaticStream}>Replace with dummy static stream</button>
        <button onClick={replaceWithNull}>Replace with null</button>
        <button onClick={replaceWithCamera}>Replace camera stream</button>
      </div>
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "8px" }}>
        <button onClick={stopCamera}>Stop a camera</button>
        <button onClick={removeCameraTrack}>Remove a camera track</button>
      </div>
      {videoStream && <VideoPlayer stream={videoStream} />}
    </div>
  );
};
