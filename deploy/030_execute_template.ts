import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { calculateFee, GasPrice } from "@cosmjs/stargate";
import { CW721 } from "./helpers";
import * as _ from "lodash";
import * as fs from "fs";

import dotenv from "dotenv";
dotenv.config();

async function main(hackatomWasmPath: string, network: string) {
  try {
    //intial execute config
    const fileName = `./deploy_config/deploy_data_${network}.json`;
    const deployData = require(fileName);

    const mnemonic = process.env.MNEMONIC ?? "";
    const signer = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: deployData.chain_config.prefix,
    });
    const [addr0, ...addrs] = await signer.getAccounts();
    const client = await SigningCosmWasmClient.connectWithSigner(deployData.chain_config.json_rpc, signer);
    const cw721 = CW721(client, deployData.fees.exec);
    const GENESIS_NFTs = cw721.use(deployData.contract_data.contract_addr);
    console.log(GENESIS_NFTs);
    
  } catch (error) {
    console.error("catchError :  ", error);
  }
}

///to run this file npx ts-node {network} eg. testnet,mainnet//

// const repoRoot = process.cwd() + "/../.."; // This assumes you are in `packages/cli`
const cw20ics20 = `../artifacts/cw721_base-aarch64.wasm`;
const appArgs = process.argv[2] ?? "";
console.info(`Reading deploy data for ${appArgs}`);
console.info(`Instantiate at ${appArgs} ...`);
main(cw20ics20, appArgs);
