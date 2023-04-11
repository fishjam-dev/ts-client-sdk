import { Callbacks, MembraneWebRTC } from "@jellyfish-dev/membrane-webrtc-js";
import TypedEmitter from "typed-emitter";
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
declare const JellyfishClient_base: new () => TypedEmitter<
  Required<MessageEvents>
>;
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
export declare class JellyfishClient<
  PeerMetadata,
  TrackMetadata
> extends JellyfishClient_base {
  private websocket;
  webrtc: MembraneWebRTC | null;
  constructor();
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
  connect(config: Config<PeerMetadata>): void;
  private setupCallbacks;
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
  cleanUp(): void;
}
export {};
//# sourceMappingURL=JellyfishClient.d.ts.map
