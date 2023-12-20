import { LogLevel } from "@prosopo/common";
import { ProsopoServerConfig } from "@prosopo/types";

export default () =>
  ({
    logLevel: LogLevel.enum.error,
    defaultEnvironment: "rococo",
    web2: true,
    solutionThreshold: 0,
    dappName: "polkadot-testnet-faucet",
    account: {
      address: process.env.CLIENT_ACCOUNT_ADDRESS || "",
      secret: process.env.CLIENT_ACCOUNT_SECRET || "",
    },
    networks: {
      rococo: {
        endpoint: process.env.SUBSTRATE_NODE_URL || "",
        contract: {
          address: process.env.PROCAPTCHA_CONTRACT_ADDRESS || "",
          name: "prosopo",
        },
        accounts: [],
      },
    },
    serverUrl: "",
  }) satisfies ProsopoServerConfig;
