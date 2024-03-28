import { Endpoint } from "@jellyfish-dev/membrane-webrtc-js";
import { ConnectConfig, JellyfishClient } from "./JellyfishClient";

export type ReconnectConfig = {
  /*
   + default: 3
   */
  maxAttempts?: number,
  /*
   * unit: milliseconds
   * default: 500
   */
  initialDelay?: number,
  /*
   * unit: milliseconds
   * default: 500
   */
  delay?: number,

  /*
   * default: false
   */
  addTracksOnReconnect?: boolean,
}


const DISABLED_RECONNECT_CONFIG: Required<ReconnectConfig> = {
  maxAttempts: 0,
  initialDelay: 0,
  delay: 0,
  addTracksOnReconnect: false
};

const DEFAULT_RECONNECT_CONFIG: Required<ReconnectConfig> = {
  maxAttempts: 3,
  initialDelay: 500,
  delay: 500,
  addTracksOnReconnect: true
};

export class ReconnectManager<PeerMetadata, TrackMetadata> {

  private readonly reconnectConfig: Required<ReconnectConfig>;

  private readonly connect: () => void;
  private readonly client: JellyfishClient<PeerMetadata, TrackMetadata>;

  private reconnectAttempt: number = 0;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private reconnectFailedNotificationSend: boolean = false;
  private ongoingReconnection: boolean = false;
  private lastLocalEndpoint: Endpoint<PeerMetadata, TrackMetadata> | null = null;

  constructor(
    client: JellyfishClient<PeerMetadata, TrackMetadata>,
    connect: () => void,
    config?: ReconnectConfig | boolean
  ) {
    this.client = client;
    this.connect = connect;
    this.reconnectConfig = createReconnectConfig(config);
  }

  public reset() {
    this.reconnectAttempt = 0;
    if (this.reconnectTimeoutId) clearTimeout(this.reconnectTimeoutId);
    this.reconnectTimeoutId = null;
  }

  public getLastPeerMetadata(): PeerMetadata | undefined {
    return this.lastLocalEndpoint?.metadata;
  }

  public reconnect(connectConfig: ConnectConfig<PeerMetadata> | null) {
    if (!connectConfig) throw Error("Invalid inner state! ConnectConfig is null");

    if (this.reconnectTimeoutId) return;

    if ((this.reconnectAttempt) >= (this.reconnectConfig.maxAttempts)) {
      if (!this.reconnectFailedNotificationSend) {
        this.reconnectFailedNotificationSend = true;
      }
      return;
    }

    if (!this.ongoingReconnection) {
      this.ongoingReconnection = true;
      this.lastLocalEndpoint = this.client.getLocalEndpoint() || null;
    }

    const timeout = this.reconnectConfig.initialDelay + this.reconnectAttempt * this.reconnectConfig.delay;

    this.reconnectAttempt += 1;

    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectTimeoutId = null;

      if (!connectConfig) throw Error("Connect config is null");

      // todo should I cleanup previous webrtc object? removeAllListeners?
      this.connect();
    }, timeout);
  }

  public handleReconnect() {
    if (!this.ongoingReconnection) return;

    if (this.lastLocalEndpoint && this.reconnectConfig.addTracksOnReconnect) {
      this.lastLocalEndpoint.tracks.forEach(async (track) => {
        if (!track.track || !track.stream) return;

        await this.client.addTrack(
          track.track,
          track.stream,
          track.rawMetadata,
          track.simulcastConfig,
          track.maxBandwidth
        );
      });
    }

    this.lastLocalEndpoint = null;
    this.ongoingReconnection = false;
    console.log("Reconnection succeeded");
  }

}

export const createReconnectConfig = (config?: ReconnectConfig | boolean): Required<ReconnectConfig> => {
  if (!config) return DISABLED_RECONNECT_CONFIG;
  if (config === true) return DEFAULT_RECONNECT_CONFIG;

  return {
    maxAttempts: config?.maxAttempts ?? DEFAULT_RECONNECT_CONFIG.maxAttempts,
    initialDelay: config?.initialDelay ?? DEFAULT_RECONNECT_CONFIG.initialDelay,
    delay: config?.delay ?? DEFAULT_RECONNECT_CONFIG.delay,
    addTracksOnReconnect: config?.addTracksOnReconnect ?? DEFAULT_RECONNECT_CONFIG.addTracksOnReconnect
  };
};
