import { networkRemove } from "src/dockerCommands";
import {
	containerPrune,
} from "../dockerCommands/container";
import { volumeRemove } from "../dockerCommands/volume";

export async function cleanupJob(): Promise<void> {
  await containerPrune();
  await networkRemove();
  await volumeRemove();
}
