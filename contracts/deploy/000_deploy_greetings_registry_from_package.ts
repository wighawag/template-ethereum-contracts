// The deploy script of the package we depend on, run as one of ours. It was
// built with that package's own `deployScript` (and so its own extensions), and
// runs against this project's environment, named accounts and network.
export {default} from 'template-ethereum-contracts/deploy/001_deploy_greetings_registry.js';
