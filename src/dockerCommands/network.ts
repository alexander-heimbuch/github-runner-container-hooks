import { runDockerCommand } from "../utils";
import { getRunnerLabel } from "./constants";

export function getNetworkName() {
	return `${getRunnerLabel()}-network`;
}

export async function networkCreate(): Promise<string> {
	const dockerArgs: string[] = ["network", "create"];
	const network = getNetworkName();
	dockerArgs.push(network);
	await runDockerCommand(dockerArgs);

	return network;
}

export async function networkRemove(): Promise<void> {
	const dockerArgs: string[] = ["network", "rm"];
	dockerArgs.push("--force");
	dockerArgs.push(getNetworkName());
	try {
		await runDockerCommand(dockerArgs);
	} catch (err) {}
}
