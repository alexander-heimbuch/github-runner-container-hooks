function volumeName(name: string): string {
	return `${getRunnerLabel()}-${name}`;
}

export const systemVolumes = [
	{
		localPath: "_work",
		target: "/__w",
		volume: volumeName("workspace"),
	},
	{
		localPath: "externals",
		target: "/__e",
		volume: volumeName("externals"),
	},
	{
		localPath: "_work/_temp/_github_home",
		target: "/github/home",
		volume: volumeName("home"),
	},
	{
		localPath: "_work/_temp/_github_workflow",
		target: "/github/workflow",
		volume: volumeName("workflow"),
	},
];

export function getRunnerLabel(): string {
	const name = process.env.RUNNER_NAME;
	if (!name) {
		throw new Error(
			"'RUNNER_NAME' env is required, please contact your self hosted runner administrator",
		);
	}
	return Buffer.from(name).toString("hex");
}

export function getRunnerVolume(): string {
	const name = process.env.RUNNER_NAME;
	if (!name) {
		throw new Error(
			"'RUNNER_NAME' env is required, please contact your self hosted runner administrator",
		);
	}

	return name;
}

export function getRunnerHome(): string {
	const name = process.env.RUNNER_HOME;
	if (!name) {
		throw new Error(
			"'RUNNER_HOME' env is required, please contact your self hosted runner administrator",
		);
	}

	return name;
}
