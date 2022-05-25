import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { calculateFee, GasPrice } from "@cosmjs/stargate";
import * as _ from "lodash";
import * as fs from "fs";

import dotenv from "dotenv";
dotenv.config();

async function main(hackatomWasmPath: string, network: string) {
  try {
    //setup chain config
    const fileName = `./deploy_config/deploy_data_${network}.json`;
    const deployData = require(fileName);

    const mnemonic = process.env.MNEMONIC ?? "";
    const signer = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: deployData.chain_config.prefix,
    });
    const [addr0, ...addrs] = await signer.getAccounts();
    const client = await SigningCosmWasmClient.connectWithSigner(deployData.chain_config.json_rpc, signer);

    // Upload contract
    const wasm = fs.readFileSync(hackatomWasmPath);
    const uploadReceipt = await client.upload(addr0.address, wasm, deployData.fees.upload, "cw721_base_test");
    console.log("smart contract codeId is : ", uploadReceipt.codeId);

    _.set(deployData, "contract_data.codeId", uploadReceipt.codeId);
    fs.writeFileSync(fileName, JSON.stringify(deployData, null, 4));
  } catch (error) {
    console.error("catchError :  ", error);
  }
}

///to run this file npx ts-node {network} eg. testnet,mainnet//

// const repoRoot = process.cwd() + "/../.."; // This assumes you are in `packages/cli`
const cw20ics20 = `../artifacts/cw721_base-aarch64.wasm`;
const appArgs = process.argv[2] ?? "";
console.info(`Reading deploy data for ${appArgs}`);
console.info(`Deploying at ${appArgs} ...`);
main(cw20ics20, appArgs);
