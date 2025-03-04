import { containerExecStep } from "../dockerCommands";
import type { RunScriptStepArgs } from "../interfaces";

export async function runScriptStep(
	args: RunScriptStepArgs,
	state,
): Promise<void> {
	await containerExecStep(args, state.container);
}
