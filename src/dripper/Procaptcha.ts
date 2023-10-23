import { getServerConfig, ProsopoServer } from "@prosopo/server";
import { ProcaptchaOutput } from "@prosopo/types";

import { ApiPromise } from "@polkadot/api";
import { logger } from "../logger";

export class Procaptcha {
  async validate(captcha: string): Promise<boolean> {
    try {
      const prosopoOutput = JSON.parse(captcha) as ProcaptchaOutput;
      const config = getServerConfig();

      const prosopoServer = new ProsopoServer(config);
      console.log(prosopoServer.wsProvider.endpoint);

      const test1 = await ApiPromise.create({ provider: prosopoServer.wsProvider });
      // console.log(test1);
      // const test2 = await prosopoServer.getSigner();
      // const test3 = await prosopoServer.getContractApi();

      // await prosopoServer.isReady();

      // await prosopoServer.getApi().rpc.chain.getBlockHash(prosopoOutput.blockNumber);

      // console.log("ready -------------- \n\n\n\n\n\0-0-0-0-09-09-09-09-09", prosopoServer.network.endpoint);

      // const captchaResult = await prosopoServer.isVerified(prosopoOutput);
      // if (captchaResult) return true;
      // logger.debug("Negative procaptcha validation result", captchaResult);
      return false;
    } catch (e) {
      logger.error(`⭕ An error occurred when validating captcha`, e);
      return false;
    }
  }
}
