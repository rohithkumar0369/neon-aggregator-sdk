const { ethers, utils } = require("ethers");

const genericSwapFacet = require("./artifacts/src/Facets/GenericSwapFacet.sol/GenericSwapFacet.json");
const IERC20 = require("./artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json");
require("dotenv").config();

const testTokenAddress = "0x1990f581BDDb170230b4cDdcEF530c915Cf74fc4";

const rpcUrl = "https://proxy.devnet.neonlabs.org/solana";

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

const amountIn = utils.parseUnits("1", 6);
const amountOut = utils.parseUnits("1", 6);

let nonce;
let gasLimit;
let gasPrice;

const initAccount = (privateKey) => {
  const wallet = new ethers.Wallet(privateKey, provider);

  return wallet;
};

const signAndSendTX = async (wallet, unsignedTx, provider) => {
  const signedTx = await wallet.signTransaction(unsignedTx);

  let tx = await provider.sendTransaction(signedTx);

  console.log(tx);

  let receipt = await tx.wait();

  return receipt;
};

// const deployerWallet = initAccount(process.env.DEPLOYER);
const userWallet = initAccount(process.env.USER);
const user2Wallet = initAccount(process.env.USER3);
const getNativeBalance = async (wallet) => {
  let balance = (await provider.getBalance(wallet.address)) / 1e18;

  return balance;
};

const initContract = (address, abi, provider) => {
  const contract = new ethers.Contract(address, abi, provider);
  return contract;
};

const start = async () => {
  console.log(utils.randomBytes(32))
  // let balance = await getNativeBalance(userWallet);

  // console.log(balance);


  // const blocknumber = await provider.getBlockNumber()

  // const timestamp = (await provider.getBlock(blocknumber)).timestamp

  // const test_token = initContract(testTokenAddress, IERC20.abi, provider);

  // let preToken_Balance = await test_token.balanceOf(userWallet.address);

  // console.log("prebalance for test token", preToken_Balance.toString());

  //  nonce = await provider.getTransactionCount(userWallet.address);

  //  const gas_limit = await test_token.estimateGas.approve(
  //     user2Wallet.address,
  //     amountIn,
  //  )

  //  console.log(gas_limit)

  // let unsignedTx = await test_token.populateTransaction.approve(
  //   user2Wallet.address,
  //   amountIn,
  //   { nonce: nonce  , gasLimit: 2000000, gasPrice: 138699406200 }
  // );

//     let receipt = await signAndSendTX(userWallet, unsignedTx, provider);

//     console.log("approval recipet", receipt)

//   let User2Token_Balance = await test_token.balanceOf(user2Wallet.address);

//   console.log("prebalance for test token", User2Token_Balance.toString());

//  let nonce1 = await provider.getTransactionCount(userWallet.address);

//  console.log("nonce",nonce1+timestamp)

//   let TransferUnsignedTx = test_token.populateTransaction.transferFrom(
//     userWallet.address,
//     user2Wallet.address,
//     amountIn,
//     { nonce: nonce1  , gasLimit: 2000000, gasPrice: 138699406200 }
//   );

//   let receipt2 = await signAndSendTX(userWallet, TransferUnsignedTx, provider);

//   console.log("transfer recipet", receipt2);

//   User2Token_Balance = await test_token.balanceOf(user2Wallet.address);
//   console.log("postBalance for test token", User2Token_Balance.toString());

};

start();

