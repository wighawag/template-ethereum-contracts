import {BuidlerRuntimeEnvironment, DeployFunction} from '@nomiclabs/buidler/types';

const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = bre;
  const {deploy} = deployments;

  const {deployer} = await getNamedAccounts();

  await deploy('ERC20TransferGateway', {
    from: deployer,
    log: true,
    deterministicDeployment: true,
  });
};
export default func;
func.tags = ['ERC20TransferGateway'];
