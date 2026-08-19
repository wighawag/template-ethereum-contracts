export default [
	{
		rules: {
			'compatible-pragma': 'error',
			curly: 'error',
			'explicit-types': 'error',
			'id-denylist': 'error',
			'imports-on-top': 'error',
			'max-state-vars': 'error',
			'named-return-params': 'error',
			'naming-convention': 'off',
			'no-console': 'error',
			'no-default-visibility': 'error',
			'no-duplicate-imports': 'error',
			'no-empty-blocks': 'error',
			'no-global-imports': 'error',
			'no-restricted-syntax': 'error',
			'no-send': 'error',
			'no-tx-origin': 'error',
			'no-unchecked-calls': 'error',
			'no-uninitialized-immutable-references': 'error',
			'no-unused-vars': 'error',
			'one-contract-per-file': 'error',
			'private-vars': 'off',
			'require-revert-reason': 'error',
			'sort-imports': 'off',
			'sort-members': 'off',
			'sort-modifiers': 'error',
		},
	},
	{
		// Test files. A test suite routinely needs small contracts alongside it -
		// a harness that exposes an abstract contract's internals, a stub that
		// misbehaves on purpose - and they are only meaningful next to the tests
		// that use them. Splitting them into files of their own would scatter the
		// suite without making anything easier to find.
		files: ['**/*.t.sol'],
		rules: {
			'one-contract-per-file': 'off',
		},
	},
];
