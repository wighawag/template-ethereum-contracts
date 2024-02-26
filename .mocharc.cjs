'use strict';
process.env.TS_NODE_FILES = true;
function stringToBoolean(val, defaultVal) {
	const strValue = String(val).toLowerCase();
	switch (strValue) {
		case 'true':
		case '1':
			return true;
		case 'false':
		case '0':
			return false;
		default:
			return defaultVal; // Default to 'defaultVal' if the value is not recognized
	}
}
module.exports = {
	'allow-uncaught': true,
	diff: true,
	extension: ['ts'],
	recursive: true,
	reporter: 'spec',
	require: ['ts-node/register', 'hardhat/register'], // ['ts-node/register/transpile-only'], (for yarn link <plugin>)
	'node-option': [
		'experimental-specifier-resolution=node',
		`loader=ts-node/esm${stringToBoolean(process.env.HARDHAT_TYPECHECK, false) ? '' : '/transpile-only'}`,
		'no-warnings=ExperimentalWarning',
		'enable-source-maps',
	],
	slow: 300,
	spec: 'test/**/*.test.ts',
	timeout: 20000,
	ui: 'bdd',
	watch: false,
	'watch-files': ['src/**/*.sol', 'test/**/*.ts'],
};
