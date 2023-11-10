import { Wait, DockerComposeEnvironment } from "testcontainers";
import {setupState} from "./globalSetupState";
import { type NetworkInterfaceInfo, networkInterfaces } from "os";

export default async function setupJellyfish() {
  console.log("setupJellyfish");
  const EXTERNAL_IP = Object.values(networkInterfaces()).flat()
    .filter((x): x is NetworkInterfaceInfo => x !== undefined)
    .filter(({family}) => typeof family === "string" ? family === "IPv4" : family === 4)
    .filter(({internal}) => !internal)
    .map(({address}) => address)[0];
    
  console.log("Attempting to start container, EXTERNAL_IP: ", EXTERNAL_IP);
    
  const container = await new DockerComposeEnvironment(".", "docker-compose-test.yaml").withEnvironment({EXTERNAL_IP})
  .withWaitStrategy(
    "jellyfish",
    Wait.forLogMessage("Access JellyfishWeb.Endpoint at")
  )
  .up();
  
  console.log("container should be running ", container.getContainer("jellyfish")?.getId());
  
  setupState.jellyfishContainer = container;
}