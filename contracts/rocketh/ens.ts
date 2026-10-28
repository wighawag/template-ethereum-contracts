import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import type {Artifact} from 'rocketh/types';

// @ensdomains/ens-contracts ships the Hardhat 3 artifacts of its own build.
// Such an artifact has the ABI and the bytecode, but not the compiler metadata,
// which rocketh keeps in the deployment record (it is what verification uses):
// that lives in the build info the artifact names, so it is read from there.

const require = createRequire(import.meta.url);
const artifactsFolder = path.join(
	path.dirname(require.resolve('@ensdomains/ens-contracts/package.json')),
	'artifacts',
);

type HardhatArtifact = {
	contractName: string;
	sourceName: string;
	inputSourceName: string;
	buildInfoId: string;
	abi: Artifact['abi'];
	bytecode: Artifact['bytecode'];
	deployedBytecode: Artifact['deployedBytecode'];
	linkReferences: unknown;
	deployedLinkReferences: unknown;
};

type BuildInfoOutput = {
	output: {
		contracts: Record<
			string,
			Record<
				string,
				Pick<Artifact, 'metadata' | 'devdoc' | 'userdoc' | 'storageLayout'>
			>
		>;
	};
};

const buildInfoOutputs = new Map<string, BuildInfoOutput>();

function readJSON<T>(file: string): T {
	return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

/**
 * Loads an ENS artifact by its path under the package's `artifacts` folder,
 * e.g. `contracts/registry/ENSRegistry.sol/ENSRegistry.json`.
 */
export function loadENSArtifact(artifactPath: string): Artifact {
	const artifact = readJSON<HardhatArtifact>(
		path.join(artifactsFolder, artifactPath),
	);
	let buildInfoOutput = buildInfoOutputs.get(artifact.buildInfoId);
	if (!buildInfoOutput) {
		buildInfoOutput = readJSON<BuildInfoOutput>(
			path.join(
				artifactsFolder,
				'build-info',
				`${artifact.buildInfoId}.output.json`,
			),
		);
		buildInfoOutputs.set(artifact.buildInfoId, buildInfoOutput);
	}
	const compiled =
		buildInfoOutput.output.contracts[artifact.inputSourceName][
			artifact.contractName
		];
	return {
		contractName: artifact.contractName,
		sourceName: artifact.sourceName,
		abi: artifact.abi,
		bytecode: artifact.bytecode,
		deployedBytecode: artifact.deployedBytecode,
		linkReferences: artifact.linkReferences,
		deployedLinkReferences: artifact.deployedLinkReferences,
		metadata: compiled.metadata,
		devdoc: compiled.devdoc,
		userdoc: compiled.userdoc,
		storageLayout: compiled.storageLayout,
	};
}
