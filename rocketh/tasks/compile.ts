import {NewTaskActionFunction} from '@ignored/hardhat-vnext/types/tasks';

import fs from 'node:fs';
import path from 'node:path';
import {ArtifactGenerationConfig} from '../type-extensions.js';

interface RunActionArguments {}

type FileTraversed = {
	name: string;
	path: string;
	relativePath: string;
	mtimeMs: number;
	directory: boolean;
};

function traverse(
	dir: string,
	result: any[] = [],
	topDir?: string,
	filter?: (name: string, stats: any) => boolean, // TODO any is Stats
): Array<FileTraversed> {
	fs.readdirSync(dir).forEach((name) => {
		const fPath = path.resolve(dir, name);
		const stats = fs.statSync(fPath);
		if ((!filter && !name.startsWith('.')) || (filter && filter(name, stats))) {
			const fileStats = {
				name,
				path: fPath,
				relativePath: path.relative(topDir || dir, fPath),
				mtimeMs: stats.mtimeMs,
				directory: stats.isDirectory(),
			};
			if (fileStats.directory) {
				result.push(fileStats);
				return traverse(fPath, result, topDir || dir, filter);
			}
			result.push(fileStats);
		}
	});
	return result;
}

function writeFiles(name: string | undefined, data: any, config: ArtifactGenerationConfig) {
	const js = typeof config?.js === 'string' ? [config?.js] : config?.js || [];
	const ts = typeof config?.ts === 'string' ? [config?.ts] : config?.ts || [];
	const json = typeof config?.json === 'string' ? [config?.json] : config?.json || [];
	const jsm = typeof config?.jsm === 'string' ? [config?.jsm] : config?.jsm || [];
	const tsm = typeof config?.tsm === 'string' ? [config?.tsm] : config?.tsm || [];

	if (ts.length > 0) {
		const newContent = `export default ${JSON.stringify(data, null, 2)} as const;`;
		for (const tsFile of ts) {
			if (tsFile.endsWith('.ts')) {
				if (!name) {
					const filepath = tsFile;
					const folderPath = path.dirname(filepath);
					fs.mkdirSync(folderPath, {recursive: true});
					fs.writeFileSync(filepath, newContent);
				}
			} else {
				if (name) {
					const filepath = `${tsFile}/${name}.ts`;
					const folderPath = path.dirname(filepath);
					fs.mkdirSync(folderPath, {recursive: true});
					fs.writeFileSync(filepath, newContent);
				}
			}
		}
	}

	if (js.length > 0) {
		const newContent = `export default /** @type {const} **/ (${JSON.stringify(data, null, 2)});`;
		// const dtsContent = `export = ${JSON.stringify(data, null, 2)} as const;`;
		const dtsContent = `declare const _default: ${JSON.stringify(data, null, 2)};export default _default;`;
		// const dtsContent = `declare const _default: ${JSON.stringify(data, null, 2)};export = _default;`;
		const cjsContent = `module.exports = /** @type {const} **/ (${JSON.stringify(data, null, 2)});`;
		for (const jsFile of js) {
			if (jsFile.endsWith('.js')) {
				if (!name) {
					const filepath = jsFile;
					const folderPath = path.dirname(filepath);
					fs.mkdirSync(folderPath, {recursive: true});
					fs.writeFileSync(filepath, newContent);
					fs.writeFileSync(filepath.replace(/\.js$/, '.d.ts'), dtsContent);
					fs.writeFileSync(filepath.replace(/\.js$/, '.cjs'), cjsContent);
				}
			} else {
				if (name) {
					const filepath = `${jsFile}/${name}.js`;
					const folderPath = path.dirname(filepath);
					fs.mkdirSync(folderPath, {recursive: true});
					fs.writeFileSync(filepath, newContent);
					fs.writeFileSync(filepath.replace(/\.js$/, '.d.ts'), dtsContent);
					fs.writeFileSync(filepath.replace(/\.js$/, '.cjs'), cjsContent);
				}
			}
		}
	}

	if (json.length > 0) {
		const newContent = JSON.stringify(data, null, 2);
		for (const jsonFile of json) {
			if (jsonFile.endsWith('.json')) {
				if (!name) {
					const filepath = jsonFile;
					const folderPath = path.dirname(filepath);
					fs.mkdirSync(folderPath, {recursive: true});
					fs.writeFileSync(filepath, newContent);
				}
			} else {
				if (name) {
					const filepath = `${jsonFile}/${name}.json`;
					const folderPath = path.dirname(filepath);
					fs.mkdirSync(folderPath, {recursive: true});
					fs.writeFileSync(filepath, newContent);
				}
			}
		}
	}

	if (!name) {
		if (tsm.length > 0) {
			let newContent = '';
			for (const key of Object.keys(data)) {
				newContent += `export const ${key} = ${JSON.stringify(data[key], null, 2)} as const;`;
			}
			for (const tsFile of tsm) {
				const filepath = tsFile;
				const folderPath = path.dirname(filepath);
				fs.mkdirSync(folderPath, {recursive: true});
				fs.writeFileSync(filepath, newContent);
			}
		}

		if (jsm.length > 0) {
			let newContent = '';
			for (const key of Object.keys(data)) {
				newContent += `export const ${key} = /** @type {const} **/ (${JSON.stringify(data[key], null, 2)});`;
			}
			for (const jsFile of jsm) {
				const filepath = jsFile;
				const folderPath = path.dirname(filepath);
				fs.mkdirSync(folderPath, {recursive: true});
				fs.writeFileSync(filepath, newContent);
			}
		}
	}
}

// TODO add docgen command ?
// task("docgen").setAction(async (args, hre, runSuper): Promise<any> => {

const runScriptWithHardhat: NewTaskActionFunction<RunActionArguments> = async (args, hre) => {
	// let previousArtifacts: {[name: string]: any} = {};
	// try {
	// 	previousArtifacts = JSON.parse(fs.readFileSync('./generated/_artifacts.json', 'utf-8'));
	// } catch {}
	// const allArtifacts: {[name: string]: any} = previousArtifacts;
	const allArtifacts: {[name: string]: any} = {};
	const shortNameDict: {[shortName: string]: boolean} = {};
	// for (const key of Object.keys(allArtifacts)) {
	// 	if (!key.indexOf('/')) {
	// 		shortNameDict[key] = true;
	// 	}
	// }

	const compilationResult = await hre.tasks.getTask('compile').run();

	console.log(compilationResult);

	// for (const artifact of artifactResult.artifactsEmittedPerFile) {
	// 	const filepath = `./artifacts/${artifact.file.sourceName}/${artifact.artifactsEmitted[0]}.json`;
	// 	if (fs.existsSync(filepath)) {
	// 		for (let i = 0; i < artifact.artifactsEmitted.length; i++) {
	// 			const shortName = artifact.artifactsEmitted[i];
	// 			const content = fs.readFileSync(filepath, 'utf-8');
	// 			const parsed = JSON.parse(content);

	// 			const debugFilepath = filepath.replace('.json', '.dbg.json');
	// 			const debugContent = fs.readFileSync(debugFilepath, 'utf-8');
	// 			const parsedDebug: {_format: string; buildInfo: string} = JSON.parse(debugContent);
	// 			const buildInfoFilepath = path.join(path.dirname(path.resolve(debugFilepath)), parsedDebug.buildInfo);
	// 			const buildInfoContent = fs.readFileSync(buildInfoFilepath, 'utf-8');
	// 			const parsedBuildInfo = JSON.parse(buildInfoContent);
	// 			const solidityOutput = parsedBuildInfo.output.contracts[artifact.file.sourceName][shortName];

	// 			const artifactObject = {...parsed, ...solidityOutput};
	// 			const fullName = `${artifact.file.sourceName}/${shortName}`;
	// 			allArtifacts[fullName] = artifactObject;
	// 			if (shortNameDict[shortName]) {
	// 				delete allArtifacts[shortName];
	// 			} else {
	// 				allArtifacts[shortName] = artifactObject;
	// 				shortNameDict[shortName] = true;
	// 			}
	// 		}
	// 	} else {
	// 		// this can happen for solidity file without contract exported, just error or types for example
	// 		// throw new Error(`no artifact at ${filepath}`);
	// 	}
	// }

	console.log(...hre.config.paths.sources.solidity);
	// const generationConfig = hre.config.generateArtifacts;
	const generationConfig: ArtifactGenerationConfig = {
		ts: ['./generated/artifacts.ts'],
		js: [],
		json: [],
		tsm: [],
		jsm: [],
		directories: [...hre.config.paths.sources.solidity],
	};

	const files: FileTraversed[] = [];
	const directories = generationConfig.directories.map((dir) => path.relative('.', dir));
	console.log({directories});
	for (const directory of directories) {
		const filesToAdd = traverse(`./artifacts/${directory}`, [], './artifacts', (name) => name != 'build-info');
		files.push(...filesToAdd);
	}

	for (const file of files) {
		if (file.directory || !file.path.endsWith('.json')) {
			continue;
		}
		const filename = path.basename(file.path);
		const dirname = path.dirname(file.relativePath);
		// const namePath = dirname.replace('.sol', '');
		const contractName = filename.replace('.json', '');
		// const shortName = artifact.artifactsEmitted[i];
		console.log({path: file.path});
		const content = fs.readFileSync(file.path, 'utf-8');
		const parsed = JSON.parse(content);

		// TODO read config for artifacts folder
		const buildInfoFilepath = path.join('artifacts', 'build-info', `${parsed.buildInfoId}.output.json`);

		console.log({buildInfoFilepath});

		const backupBuildInfoFilepath = path.join(
			'./generated',
			buildInfoFilepath.slice(buildInfoFilepath.indexOf('/', 1)),
		);
		let buildInfoFilepathToUse = buildInfoFilepath;
		if (!fs.existsSync(buildInfoFilepathToUse)) {
			buildInfoFilepathToUse = backupBuildInfoFilepath;
		}
		if (fs.existsSync(buildInfoFilepathToUse)) {
			const buildInfoContent = fs.readFileSync(buildInfoFilepathToUse, 'utf-8');

			if (buildInfoFilepathToUse !== backupBuildInfoFilepath) {
				fs.mkdirSync(path.dirname(backupBuildInfoFilepath), {recursive: true});
				fs.writeFileSync(backupBuildInfoFilepath, buildInfoContent);
			}

			const parsedBuildInfo = JSON.parse(buildInfoContent);
			const solidityOutput = parsedBuildInfo.output.contracts[dirname][contractName];

			const artifactObject = {...parsed, ...solidityOutput};
			const fullName = `${dirname}/${contractName}`;
			allArtifacts[fullName] = artifactObject;
			if (shortNameDict[contractName]) {
				delete allArtifacts[contractName];
			} else {
				allArtifacts[contractName] = artifactObject;
				shortNameDict[contractName] = true;
			}
		}
	}
	for (const key of Object.keys(allArtifacts)) {
		if (key.indexOf('/') >= 0) {
			const split = key.split('/');
			if (split.length > 1) {
				const shortName = split[split.length - 1];
				if (allArtifacts[shortName]) {
					delete allArtifacts[key];
				}
			}
		}
	}

	for (const key of Object.keys(allArtifacts)) {
		const artifact = allArtifacts[key];
		writeFiles(key, artifact, generationConfig);
	}
	// const json = hre.config.generateArtifacts.json || [];
	// json.push('./generated/_artifacts.json');
	// writeFiles(undefined, allArtifacts, {...hre.config.generateArtifacts, json: json});

	writeFiles(undefined, allArtifacts, generationConfig);

	return compilationResult;
};
export default runScriptWithHardhat;
