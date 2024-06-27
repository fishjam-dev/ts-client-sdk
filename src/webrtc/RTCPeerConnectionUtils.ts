export const findSender = (
  connection: RTCPeerConnection | undefined,
  trackId: string,
): RTCRtpSender =>
  connection!
    .getSenders()
    .find((sender) => sender.track && sender!.track!.id === trackId)!;

export const findSenderByTrack = (
  connection: RTCPeerConnection | undefined,
  track: MediaStreamTrack | null | undefined,
): RTCRtpSender | undefined =>
  connection?.getSenders().filter((sender) => sender.track === track)[0];

export const isTrackInUse = (
  connection: RTCPeerConnection | undefined,
  track: MediaStreamTrack,
) => connection?.getSenders().some((val) => val.track === track);
