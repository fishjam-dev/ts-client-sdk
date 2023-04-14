import React, { useCallback, useContext, useMemo, useState } from "react";
import { PeerApi, RoomApi } from "../server-sdk";
import axios from "axios";

axios.defaults.headers.common["Authorization"] = `Bearer development`;

const localStorageServerAddress = "serverAddress";

export type ServerSdkType = {
  setServerAddress: (value: string) => void;
  serverAddress: string;
  websocketUrl: string;
  roomApi: RoomApi;
  peerApi: PeerApi;
};

const ServerSdkContext = React.createContext<ServerSdkType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export const ServerSDKProvider = ({ children }: Props) => {
  const [serverAddress, setServerAddressState] = useState<string>(() => {
    const serverAddress = localStorage.getItem(localStorageServerAddress);
    return serverAddress ? serverAddress : "http://localhost:4000";
  });

  const setServerAddress = useCallback(
    (value: string) => {
      setServerAddressState(value);
      localStorage.setItem(localStorageServerAddress, value);
    },
    [setServerAddressState]
  );
  const roomApi = useMemo(() => new RoomApi(undefined, serverAddress, axios), [serverAddress]);
  const peerApi = useMemo(() => new PeerApi(undefined, serverAddress, axios), [serverAddress]);

  const websocketUrl = useMemo(() => serverAddress.replace("http", "ws") + "/socket/websocket", [serverAddress]);

  return (
    <ServerSdkContext.Provider
      value={{
        websocketUrl,
        serverAddress,
        setServerAddress,
        roomApi,
        peerApi,
      }}
    >
      {children}
    </ServerSdkContext.Provider>
  );
};

export const useServerSdk = (): ServerSdkType => {
  const context = useContext(ServerSdkContext);
  if (!context) throw new Error("useServerAddress must be used within a DeveloperInfoProvider");
  return context;
};
