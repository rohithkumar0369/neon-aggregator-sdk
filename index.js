const { ethers, utils } = require("ethers");

const genericSwapFacet = require("./artifacts/src/Facets/GenericSwapFacet.sol/GenericSwapFacet.json");
const IERC20 = require("./artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json");
require("dotenv").config();

const kanaDiamondAddress = "0x46699e45B05952447210032a8C20CcdcAf751Ee2";
const moraswapAddress = "0x696d73D7262223724d60B2ce9d6e20fc31DfC56B";
const wneon_address = "0xf1041596da0499c3438e3B1Eb7b95354C6Aed1f5";
const mUSDC_ADDRESS = "0x7ff459CE3092e8A866aA06DA88D291E2E31230C1";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const mora_address = "0x6Ab1F83c0429A1322D7ECDFdDf54CE6D179d911f";
//const rpcUrl = "https://devnet.neonevm.org";

const rpcUrl = "https://proxy.devnet.neonlabs.org/solana";

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

const amountIn = utils.parseUnits("9", 6);
const amountOut = utils.parseUnits("10", 6);

const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

let nonce;
let gasLimit;
let gasPrice;

const initAccount = (privateKey) => {
  const wallet = new ethers.Wallet(privateKey, provider);

  return wallet;
};

// const deployerWallet = initAccount(process.env.DEPLOYER);
const userWallet = initAccount(process.env.USER);

const getNativeBalance = async (wallet) => {
  let balance = (await provider.getBalance(wallet.address)) / 1e18;

  return balance;
};

const getSwapDate = async (moraswap) => {
  const swapData = await moraswap.populateTransaction.swap(
    0,
    1,
    amountIn,
    amountOut,
    deadline
  );
  return swapData;
};

const getSignerFromAddress = (address) => {
  const signer = provider.getSigner(address);
  return signer;
};

const initContract = (address, abi, provider) => {
  const contract = new ethers.Contract(address, abi, provider);
  return contract;
};

const signAndSendTX = async (wallet, unsignedTx, provider) => {
  const signedTx = await wallet.signTransaction(unsignedTx);

  let tx = await provider.sendTransaction(signedTx);

  console.log(tx);

  let receipt = await tx.wait();

  return receipt;
};

const start = async () => {
  let balance = await getNativeBalance(userWallet);

  console.log(balance);

  const genericSwap = initContract(
    kanaDiamondAddress,
    genericSwapFacet.abi,
    provider
  );

  const signer = getSignerFromAddress(userWallet.address);

  const moraswapfunc = [
    "function swap(uint8,uint8,uint256,uint256,uint256) external payable returns (uint256)",
  ];

  const moraswap = initContract(moraswapAddress, moraswapfunc, undefined);

  const swapData = await getSwapDate(moraswap);

  const mora_token = initContract(mora_address, IERC20.abi, provider);

  let preTokenA_Balance = await mora_token.balanceOf(userWallet.address);

  console.log("prebalance for token A", preTokenA_Balance.toString())

  let gasPrice = await provider.getGasPrice();

  let nonce = await provider.getTransactionCount(userWallet.address);

  // let estimateGas = await mora_token.estimateGas.approve(
  //   genericSwap.address,
  //   amountIn,
  // )

  let unsignedTx = await mora_token.populateTransaction.approve(
    genericSwap.address,
    amountIn,
    { nonce: nonce, gasLimit:200000, gasPrice: gasPrice }
  );

  let receipt = await signAndSendTX(userWallet, unsignedTx, provider);

  console.log("approval recipet", receipt)

  let wneon_token = initContract(wneon_address, IERC20.abi, provider);

  let preTokenB_Balance = await wneon_token.balanceOf(userWallet.address);

  console.log("prebalance for token B",preTokenB_Balance.toString());



  try {

    nonce = await provider.getTransactionCount(userWallet.address);

    //  gasLimit = await genericSwap.estimateGas.swapTokensGeneric(
    //   utils.randomBytes(32),
    //   "Moraswap",
    //   ZERO_ADDRESS,
    //   userWallet.address,
    //   utils.parseUnits("1", 6),
    //   [
    //     {
    //       callTo: String(swapData.to),
    //       approveTo: String(swapData.to),
    //       sendingAssetId: mora_address,
    //       receivingAssetId: wneon_address,
    //       callData: String(swapData?.data),
    //       fromAmount: amountIn,
    //       requiresDeposit: true,
    //     },
    //   ],
    //  )

    let swapData_to = swapData.to
    let swapData_Data = swapData.data
    console.log(swapData)
    console.log(utils.randomBytes(32))
    console.log(utils.parseUnits("3", 6))
    console.log({
      callTo: String(swapData.to),
      approveTo: String(swapData.to),
      sendingAssetId: mora_address,
      receivingAssetId: wneon_address,
      callData: String(swapData?.data),
      fromAmount: amountIn,
      requiresDeposit: true,
    },)

    let unsignedSwapData = await genericSwap.populateTransaction.swapTokensGeneric(
      utils.randomBytes(32),
      "Moraswap",
      ZERO_ADDRESS,
      userWallet.address,
      utils.parseUnits("1", 6),
      [
        {
          callTo: String(swapData.to),
          approveTo: String(swapData.to),
          sendingAssetId: mora_address,
          receivingAssetId: wneon_address,
          callData: String(swapData?.data),
          fromAmount: amountIn,
          requiresDeposit: true,
        },
      ],
      {
        gasLimit: 3450060,
        nonce: nonce,
         gasPrice: gasPrice,
       }
    );

    console.log(unsignedSwapData);

    let receipt2 = await signAndSendTX(userWallet , unsignedSwapData , provider)

    console.log(receipt2)
  } catch (err) {
    console.log(err);
  }

};

start();
