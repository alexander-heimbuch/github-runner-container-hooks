import * as events from "node:events";
import * as fs from "node:fs";
import * as os from "node:os";
import { env } from "node:process";
import * as readline from "node:readline";
import * as core from "@actions/core";

import type { HookData } from "./interfaces";

// Import this way otherwise typescript has errors
const exec = require("@actions/exec");
const shlex = require("shlex");

export interface RunDockerCommandOptions {
	workingDir?: string;
	input?: Buffer;
	env?: { [key: string]: string };
}

export async function runDockerCommand(
	args: string[],
	options?: RunDockerCommandOptions,
): Promise<string> {
	const optionsEnv = optionsWithDockerEnvs(options);
	const fixedArgs = fixArgs(args);
	const pipes = await exec.getExecOutput("docker", fixedArgs, optionsEnv);
	if (pipes.exitCode !== 0) {
		core.error(`Docker failed with exit code ${pipes.exitCode}`);
		return Promise.reject(pipes.stderr);
	}
	return Promise.resolve(pipes.stdout);
}

export function optionsWithDockerEnvs(
	options?: RunDockerCommandOptions,
): RunDockerCommandOptions | undefined {
	// From https://docs.docker.com/engine/reference/commandline/cli/#environment-variables
	const dockerCliEnvs = new Set([
		"DOCKER_API_VERSION",
		"DOCKER_CERT_PATH",
		"DOCKER_CONFIG",
		"DOCKER_CONTENT_TRUST_SERVER",
		"DOCKER_CONTENT_TRUST",
		"DOCKER_CONTEXT",
		"DOCKER_DEFAULT_PLATFORM",
		"DOCKER_HIDE_LEGACY_COMMANDS",
		"DOCKER_HOST",
		"DOCKER_STACK_ORCHESTRATOR",
		"DOCKER_TLS_VERIFY",
		"BUILDKIT_PROGRESS",
	]);
	const dockerEnvs = {};
	for (const key in process.env) {
		if (dockerCliEnvs.has(key)) {
			dockerEnvs[key] = process.env[key];
		}
	}

	const newOptions = {
		workingDir: options?.workingDir,
		input: options?.input,
		env: options?.env || {},
	};

	// Set docker envs or overwrite provided ones
	for (const [key, value] of Object.entries(dockerEnvs)) {
		newOptions.env[key] = value as string;
	}

	return newOptions;
}

export function sanitize(val: string): string {
	if (!val || typeof val !== "string") {
		return "";
	}
	const newNameBuilder: string[] = [];
	for (let i = 0; i < val.length; i++) {
		const char = val.charAt(i);
		if (!newNameBuilder.length) {
			if (isAlpha(char)) {
				newNameBuilder.push(char);
			}
		} else {
			if (isAlpha(char) || isNumeric(char) || char === "_") {
				newNameBuilder.push(char);
			}
		}
	}
	return newNameBuilder.join("");
}

export function fixArgs(args: string[]): string[] {
	return shlex.split(args.join(" "));
}

export function checkEnvironment(): void {
	if (!env.GITHUB_WORKSPACE) {
		throw new Error("GITHUB_WORKSPACE is not set");
	}
}

// isAlpha accepts single character and checks if
// that character is [a-zA-Z]
function isAlpha(val: string): boolean {
	return (
		val.length === 1 &&
		((val >= "a" && val <= "z") || (val >= "A" && val <= "Z"))
	);
}

function isNumeric(val: string): boolean {
	return val.length === 1 && val >= "0" && val <= "9";
}

export async function getInputFromStdin(): Promise<HookData> {
	let input = "";

	const rl = readline.createInterface({
		input: process.stdin,
	});

	rl.on("line", (line) => {
		input = line;
	});

	await events.default.once(rl, "close");
	const inputJson = JSON.parse(input);
	return inputJson as HookData;
}

function toCommandValue(input: any): string {
	if (input === null || input === undefined) {
		return "";
	}

	if (typeof input === "string" || input instanceof String) {
		return input as string;
	}

	return JSON.stringify(input);
}

export function writeToResponseFile(filePath: string, message: any): void {
	if (!filePath) {
		throw new Error("Expected file path");
	}
	if (!fs.existsSync(filePath)) {
		throw new Error(`Missing file at path: ${filePath}`);
	}

	fs.appendFileSync(filePath, `${toCommandValue(message)}${os.EOL}`, {
		encoding: "utf8",
	});
}
