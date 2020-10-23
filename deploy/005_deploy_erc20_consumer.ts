import {HardhatRuntimeEnvironment, DeployFunction} from 'hardhat/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const {deployer} = await getNamedAccounts();

  const erc20Token = await deployments.get('ERC20Token');
  const erc20TransferGateway = await deployments.get('ERC20TransferGateway');

  await deploy('ERC20Consumer', {
    from: deployer,
    args: [erc20TransferGateway.address, erc20Token.address, '500000000000000000'],
    log: true,
  });
};

export default func;
func.tags = ['ERC20Consumer'];
func.dependencies = ['ERC20TransferGateway', 'ERC20Token'];
