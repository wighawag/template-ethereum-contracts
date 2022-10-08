module.exports = {
	useTabs: true,
	singleQuote: true,
	printWidth: 120,
	bracketSpacing: false,
	overrides: [
		{
			files: '*.sol',
			options: {
				printWidth: 120,
				singleQuote: false,
				explicitTypes: 'always',
				parser: 'solidity-parse'
			}
		}
	],
	plugins: [require('prettier-plugin-solidity')]
};
