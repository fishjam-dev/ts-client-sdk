import { setupState } from "./globalSetupState";

export default async function teardownJellyfish() {
  console.log("teardown")
  await setupState.jellyfishContainer?.down();
  console.log("teardown down")
}