import {
  Callbacks,
  MembraneWebRTC,
  Peer,
  SerializedMediaEvent,
  TrackContext,
} from "@jellyfish-dev/membrane-webrtc-js";
import TypedEmitter from "typed-emitter";
import { EventEmitter } from "events";

/**
 * Events emitted by the client with their arguments.
 * OnSendMediaEvent is omitted because it is handled internally.
 * Other events come from {@link Callbacks} defined in MembraneWebRTC.
 */
export interface MessageEvents
  extends Omit<Required<Callbacks>, "onSendMediaEvent"> {
  /**
   * Emitted when the websocket connection is closed
   * @param {CloseEvent} event - Close event object from the websocket
   */
  onSocketClose: (event: CloseEvent) => void;

  /**
   * Emitted when occurs an error in the websocket connection
   * @param {Event} event - Event object from the websocket
   */
  onSocketError: (event: Event) => void;

  /**
   * Emitted when the websocket connection is opened
   * @param {Event} event - Event object from the websocket
   */
  onSocketOpen: (event: Event) => void;

  /**
   * Emitted when authentication is requested via websocket
   */
  onAuthRequest: () => void;

  /**
   * Emitted when authentication is successful
   */
  onAuthSuccess: () => void;

  /**
   * Emitted when authentication fails
   */
  onAuthError: () => void;

  /**
   * Emitted when the connection is closed
   */
  onDisconnected: () => void;
}

/**
 * Configuration object for the client
 */
export interface Config<PeerMetadata> {
  /**
   * Metadata for the peer
   */
  peerMetadata: PeerMetadata;

  /**
   * Whether to enable simulcast or not
   */
  isSimulcastOn: boolean;

  /**
   * URL of the websocket server
   */
  websocketUrl?: string;

  /**
   * Token for authentication
   */
  token: string;
}

/**
 * JellyfishClient is the main class to interact with Jellyfish.
 *
 * @example
 * ```typescript
 * const client = new JellyfishClient();
 * const peerToken = "YOUR_PEER_TOKEN";
 *
 * // Start the peer connection
 * client.connect({
 *    peerMetadata: {},
 *    isSimulcastOn: false,
 *    token: peerToken,
 * });
 *
 * // You can listen to events emitted by the client
 * client.on("onJoinSuccess", (peerId, peersInRoom) => {
 *   console.log("join success");
 * });
 *
 * // Close the peer connection
 * client.cleanUp();
 * ```
 */
export class JellyfishClient<
  PeerMetadata,
  TrackMetadata
> extends (EventEmitter as new () => TypedEmitter<Required<MessageEvents>>) {
  private websocket: WebSocket | null = null;
  // todo make this object private and expose all public methods
  webrtc: MembraneWebRTC | null = null;

  constructor() {
    super();
  }

  /**
   * Uses the {@link WebSocket} connection and {@link MembraneWebRTC} to join to the room.
   * Registers the callbacks to handle the events emitted by the {@link MembraneWebRTC}.
   *
   * @param {ConnectConfig} config - Configuration object for the client
   * @param {string} [config.websocketUrl="ws://localhost:4000/socket/websocket"] - URL of the websocket server defaults to `ws://localhost:4000/socket/websocket`
   *
   * @example
   * ```typescript
   * const client = new JellyfishClient();
   *
   * client.connect({
   *  peerMetadata: {},
   *  isSimulcastOn: false,
   *  token: peerToken,
   * });
   * ```
   */
  connect(config: Config<PeerMetadata>): void {
    const {
      peerMetadata,
      isSimulcastOn,
      websocketUrl = "ws://localhost:4000/socket/websocket",
    } = config;

    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      console.warn("Closing existing websocket connection");
      this.cleanUp();
    }

    console.log({ websocketUrl });

    this.websocket = new WebSocket(`${websocketUrl}`);

    this.websocket.addEventListener("open", (event) => {
      this.emit("onSocketOpen", event);
    });
    this.websocket.addEventListener("error", (event) => {
      this.emit("onSocketError", event);
    });
    this.websocket.addEventListener("close", (event) => {
      const reason = event.reason;
      console.log("socket closed with reason", reason);
      this.emit("onSocketClose", event);
    });

    this.websocket.addEventListener("open", (_event) => {
      this.websocket?.send(
        JSON.stringify({
          type: "controlMessage",
          data: {
            type: "authRequest",
            token: config?.token,
          },
        })
      );

      this.emit("onAuthRequest");
    });

    this.webrtc = new MembraneWebRTC();

    this.setupCallbacks();
    // TODO remove after discussion
    // this.setupCallbacks2();

    this.websocket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if (data["type"] == "controlMessage") {
        console.log("controlMessage", data["data"]);
        if (data["data"]["type"] == "authenticated") {
          // Change state to connected
          this.emit("onAuthSuccess");
        } else if (data["data"]["type"] == "unauthenticated") {
          // Change state to connected
          this.emit("onAuthError");
        }
      } else {
        this.webrtc?.receiveMediaEvent(data["data"]);
      }
    });

    this.websocket.addEventListener("open", (_event) => {
      this.webrtc?.join(peerMetadata);
    });
  }

  private setupCallbacks() {
    this.webrtc?.on("onSendMediaEvent", (mediaEvent: SerializedMediaEvent) => {
      const messageJS = {
        type: "mediaEvent",
        data: mediaEvent,
      };

      const message = JSON.stringify(messageJS);
      this.websocket?.send(message);
    });

    this.webrtc?.on("onConnectionError", (message) =>
      this.emit("onConnectionError", message)
    );
    this.webrtc?.on("onJoinSuccess", (peerId, peersInRoom: [Peer]) => {
      this.emit("onJoinSuccess", peerId, peersInRoom);
    });
    this.webrtc?.on("onRemoved", (reason) => {
      this.emit("onRemoved", reason);
    });
    this.webrtc?.on("onPeerJoined", (peer) => {
      this.emit("onPeerJoined", peer);
    });
    this.webrtc?.on("onPeerLeft", (peer) => {
      this.emit("onPeerLeft", peer);
    });
    this.webrtc?.on("onPeerUpdated", (peer: Peer) => {
      this.emit("onPeerUpdated", peer);
    });
    this.webrtc?.on("onTrackReady", (ctx: TrackContext) => {
      this.emit("onTrackReady", ctx);
    });
    this.webrtc?.on("onTrackAdded", (ctx) => {
      this.emit("onTrackAdded", ctx);
    });
    this.webrtc?.on("onTrackRemoved", (ctx) => {
      this.emit("onTrackRemoved", ctx);
    });
    this.webrtc?.on("onTrackUpdated", (ctx: TrackContext) => {
      this.emit("onTrackUpdated", ctx);
    });
    this.webrtc?.on(
      "onTracksPriorityChanged",
      (enabledTracks: TrackContext[], disabledTracks: TrackContext[]) => {
        this.emit("onTracksPriorityChanged", enabledTracks, disabledTracks);
      }
    );
    this.webrtc?.on("onJoinError", (metadata) => {
      this.emit("onJoinError", metadata);
    });
    this.webrtc?.on("onBandwidthEstimationChanged", (estimation) => {
      this.emit("onBandwidthEstimationChanged", estimation);
    });
  }

  /**
   * Disconnect from the room, and close the websocket connection.
   * Tries to leave the room gracefully, but if it fails, it will close the websocket anyway.
   *
   * @example
   * ```typescript
   * const client = new JellyfishClient();
   *
   * client.connect({ ... });
   *
   * client.cleanUp();
   * ```
   */
  cleanUp() {
    try {
      this.webrtc?.leave();
    } catch (e) {
      console.warn(e);
    }
    this.websocket?.close();
    this.websocket = null;
    this.emit("onDisconnected");
  }
}
