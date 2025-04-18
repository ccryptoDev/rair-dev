const ethers = require('ethers');
const log = require('../../utils/logger')(module);
const RAIR_ERC721Abi = require('./contracts/RAIR_ERC721.json').abi;

const config = require('../../config');

const endpoints = {
  '0x13881': process.env.MATIC_TESTNET_RPC,
  mumbai: process.env.MATIC_TESTNET_RPC,
  '0x89': process.env.MATIC_MAINNET_RPC,
  matic: process.env.MATIC_MAINNET_RPC,
  '0x61': process.env.BINANCE_TESTNET_RPC,
  'binance-testnet': process.env.BINANCE_TESTNET_RPC,
  '0x38': process.env.BINANCE_MAINNET_RPC,
  'binance-mainnet': process.env.BINANCE_MAINNET_RPC,
  '0x1': process.env.ETHEREUM_MAINNET_RPC,
  ethereum: process.env.ETHEREUM_MAINNET_RPC,
  '0x5': process.env.ETHEREUM_TESTNET_GOERLI_RPC,
  goerli: process.env.ETHEREUM_TESTNET_GOERLI_RPC,
};

/**
 * Check that a public address has tokens in a product inside a RAIR-ERC721 contract
 * @param  {string} accountAddress      Account to check balance of
 * @param  {string} blockchain          Endpoint where Infura gets connected
 * @param  {string} contractAddress     Address of RAIR ERC721 contract
 * @param  {string} productId           Product ID within the contract
 * @param  {string} offerRangeStart     Start of the range to look for
 * @param  {string} offerRangeEnd       End of the range to look for
 * @return {boolean}               			Returns true if the account has at least one of the given token
 */
async function checkBalanceProduct(
  accountAddress,
  blockchain,
  contractAddress,
  productId,
  offerRangeStart,
  offerRangeEnd
) {
  // Static RPC Providers are used because the chain ID *WILL NOT* change,
  //		doing this we save calls to the blockchain to verify Chain ID
  try {
    let provider = new ethers.providers.StaticJsonRpcProvider(
      endpoints[blockchain]
    );
    const tokenInstance = new ethers.Contract(
      contractAddress,
      RAIR_ERC721Abi,
      provider
    );
    const result = await tokenInstance.hasTokenInProduct(
      accountAddress,
      productId,
      offerRangeStart,
      offerRangeEnd
    );
    delete provider;
    return result;
  } catch (error) {
    log.error(
      'Error querying a range of NFTs on RPC: ',
      endpoints[blockchain]
    );
    log.error(error);
  }
  return false;
}

/**
 * Check that a public address has a specific token inside an ERC721 contract
 * @param  {string} accountAddress      Account to check balance of
 * @param  {string} blockchain          Endpoint where Infura gets connected
 * @param  {string} contractAddress     Address of RAIR ERC721 contract
 * @param  {string} tokenId 			      Token to look for
 * @return {boolean}                		Returns true if the account owns the token
 */
async function checkBalanceSingle(
  accountAddress,
  blockchain,
  contractAddress,
  tokenId
) {
  // Static RPC Providers are used because the chain ID *WILL NOT* change,
  //		doing this we save calls to the blockchain to verify Chain ID
  try {
    let provider = new ethers.providers.StaticJsonRpcProvider(
      endpoints[blockchain]
    );
    const tokenInstance = new ethers.Contract(
      contractAddress,
      RAIR_ERC721Abi,
      provider
    );
    const result = await tokenInstance.ownerOf(tokenId);
    delete provider;
    return result.toLowerCase() === accountAddress;
  } catch (error) {
    console.error(
      'Error querying a single NFT on RPC: ',
      endpoints[blockchain]
    );
    log.error(error);
  }
  return false;
}

const checkBalanceAny = async (userAddress, chain, contractAddress) => {
  try {
    let provider = new ethers.providers.StaticJsonRpcProvider(
      endpoints[chain]
    );
    const tokenInstance = new ethers.Contract(
      contractAddress,
      RAIR_ERC721Abi,
      provider
    );
    const result = await tokenInstance.balanceOf(userAddress);
    return result.gt(ethers.BigNumber.from(0));
  } catch (err) {
    log.error(`Error querying tokens for user ${accountAddress} from admin Contract.`);
    log.error(err);
    return false;
  }
}

async function checkAdminTokenOwns(accountAddress) {
  return await checkBalanceAny(accountAddress, config.admin.network, config.admin.contract);
}

module.exports = {
  checkBalanceProduct,
  checkBalanceSingle,
  checkAdminTokenOwns,
  checkBalanceAny
};
