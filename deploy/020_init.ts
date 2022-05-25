import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { calculateFee, GasPrice } from "@cosmjs/stargate";
import * as _ from "lodash";
import * as fs from "fs";

import dotenv from "dotenv";
dotenv.config();

async function main(hackatomWasmPath: string, network: string) {
  try {
    const fileName = `./deploy_config/deploy_data_${network}.json`;
    const deployData = require(fileName);

    const mnemonic = process.env.MNEMONIC ?? "";
    const signer = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: deployData.chain_config.prefix,
    });
    const [addr0, ...addrs] = await signer.getAccounts();
    const client = await SigningCosmWasmClient.connectWithSigner(deployData.chain_config.json_rpc, signer);

    // Instantiate
    // This contract specific message is passed to the contract
    const msg = {
      name: "Genesis NFTs",
      symbol: "OG",
      minter: addr0.address,
    };
    const { contractAddress } = await client.instantiate(
      addr0.address,
      deployData.contract_data.codeId,
      msg,
      "cw721_base_test",
      deployData.fees.init,
      { memo: `Create a cw721_base_test` }
    );

    console.info(`Contract instantiated at: `, contractAddress);
    _.set(deployData, "contract_data.contract_addr", contractAddress);
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
console.info(`Instantiate at ${appArgs} ...`);
main(cw20ics20, appArgs);
