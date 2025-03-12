// execute is needed to register your script
import {execute} from 'rocketh';
// here we add the `@rocketh/deploy` extension that let you use the deploy function (hardhat-deploy v2 is fully modular)
import '@rocketh/deploy';
// here we import the context, the convention is to import it from a file named `_context.ts`
import {context} from './_context.js';

export default execute(
	// we pass the context to the "execute" function
	// it will transform it while keeping type safety (in particular namedAccounts)
	context,
	// then you pass in your function that can do whatever it wants
	async ({deploy, namedAccounts, artifacts}) => {
		const {deployer} = namedAccounts;

		await deploy('GreetingsRegistry', {
			account: deployer,
			artifact: artifacts.GreetingsRegistry,
			args: [''],
		});
	},
	// finally you can pass tags and dependencies
	{tags: ['GreetingsRegistry', 'GreetingsRegistry_deploy']},
);
