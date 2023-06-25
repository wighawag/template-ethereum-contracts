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
				parser: 'solidity-parse'
			}
		}
	],
	plugins: [require('prettier-plugin-solidity')]
};
