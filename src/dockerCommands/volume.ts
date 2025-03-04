import { runDockerCommand } from "../utils";
import { getRunnerLabel, systemVolumes } from "./constants";

export async function volumeCreate(name: string): Promise<string> {
	const dockerArgs: string[] = ["volume", "create", name];
	dockerArgs.push("--label", getRunnerLabel());
	return runDockerCommand(dockerArgs).then((res) => res.trim());
}

export async function volumeRemove(): Promise<void> {
	const dockerArgs: string[] = ["volume", "rm"];
	dockerArgs.push("--force");
	for (const volume of systemVolumes) {
		try {
			await runDockerCommand([...dockerArgs, volume.volume]);
		} catch (err) {}
	}
}
