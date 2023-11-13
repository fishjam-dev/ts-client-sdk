import { test, expect, Page } from '@playwright/test';
import { type JellyfishClient } from "../src/JellyfishClient";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test('displays basic UI', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Jellyfish Client/);
  await expect(page.getByLabel('Peer Token')).toBeVisible();
  await expect(page.getByLabel('Peer name')).toBeVisible();
  
});

test("connects to Jellyfish Server", async ({ page: firstPage, context }) => {
  const secondPage = await context.newPage();
  await firstPage.goto("/");
  await secondPage.goto("/");

  const roomRequest = await firstPage.request.post("http://localhost:5002/room")
  const roomId = (await roomRequest.json()).data.room.id as string;

  const firstClientId = await joinRoomAndAddTrack(firstPage, roomId);
  const secondClientId = await joinRoomAndAddTrack(secondPage, roomId);
  
  await assertThatOtherIsSeen(firstPage, secondClientId);
  await assertThatOtherIsSeen(secondPage, firstClientId);
  
  await Promise.all([assertThatOtherVideoIsPlaying(firstPage),
  assertThatOtherVideoIsPlaying(secondPage)]);
});

async function joinRoomAndAddTrack(page: Page, roomId: string): Promise<string> {
  const peerRequest = await page.request.post("http://localhost:5002/room/"+roomId+"/peer", { data: {
    type: "webrtc",
    options: {
      enableSimulcast: true
    }
  }});
  const { peer: { id: peerId }, token: peerToken } = (await peerRequest.json()).data;
  
  console.log({peerId, peerToken});

  await page.getByLabel("Peer Token").fill(peerToken);
  await page.getByLabel("Peer name").fill(peerId);
  
  // await sleep(2000);
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await expect(page.locator('#local-track-video')).toBeVisible();
  await page.locator('#add-track-btn').click();
  return peerId; 
}

async function assertThatOtherIsSeen(page: Page, otherClientId: string) {
  const remotePeersContainer = page.locator("#remote-peers-container");
  await expect(remotePeersContainer).toBeVisible();
  const otherClientCard = remotePeersContainer.locator(`css=[data-peer-id="${otherClientId}"]`);
  await expect(otherClientCard).toBeVisible();
  await expect(otherClientCard).toContainText(`Client: ${otherClientId}`);
  await expect(otherClientCard.locator("video")).toBeVisible();
}
async function assertThatOtherVideoIsPlaying(page: Page) {
  const playing = await page.evaluate(async () => {
    const sleep = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const getDecodedFrames = async () => {
      const stats = await peerConnection.getStats();
      for (const stat of stats.values()) {
        if (stat.type === "inbound-rtp") {
          return stat.framesDecoded
        }
      }
    }

    const client = (window as any).client as JellyfishClient<unknown, unknown>;
    const peerConnection = (client as any).webrtc.connection as RTCPeerConnection;
    const track = Object.values(client.getRemoteTracks())[0].track;
    const firstMeasure = await getDecodedFrames();
    await sleep(5000);
    const secondMeasure = await getDecodedFrames();
    return secondMeasure > firstMeasure;
  })
  expect(playing).toBe(true);
}

