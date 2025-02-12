import {NewTaskActionFunction} from '@ignored/hardhat-vnext/types/tasks';
import {ConfigOptions, loadAndExecuteDeployments} from 'rocketh';

interface RunActionArguments {
	saveDeployments: boolean;
	skipPrompts: boolean;
}

const runScriptWithHardhat: NewTaskActionFunction<RunActionArguments> = async (args, hre) => {
	console.log(args);
	let saveDeployments = args.saveDeployments;
	if (process.env.HARDHAT_FORK) {
		saveDeployments = false;
	}
	const connection = await hre.network.connect();
	await loadAndExecuteDeployments({
		...(args as ConfigOptions),
		logLevel: 1,
		provider: connection.provider as unknown as any, // TODO type
		network: process.env.HARDHAT_FORK ? {fork: process.env.HARDHAT_FORK} : connection.networkName,
		saveDeployments,
		askBeforeProceeding: args.skipPrompts ? false : true,
		// reportGasUse: args.skipGasReport ? false : true,
	});
};
export default runScriptWithHardhat;
