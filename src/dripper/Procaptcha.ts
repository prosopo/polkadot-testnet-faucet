import { KeypairType } from "@polkadot/util-crypto/types";
import { getPair } from "@prosopo/common";
import { ProsopoServer } from "@prosopo/server";
import { ProcaptchaOutput } from "@prosopo/types";

import { logger } from "../logger";
import prosopoConfig from "../prosopoData";

export class Procaptcha {
  async validate(prosopoPayload: string): Promise<boolean> {
    try {
      const pairType = "sr25519" as KeypairType;
      const ss58Format = 42;
      const pair = await getPair(pairType, ss58Format, process.env.CLIENT_ACCOUNT_SECRET || "");
      const prosopoServer = new ProsopoServer(pair, prosopoConfig());
      const prosopoOutput: ProcaptchaOutput = JSON.parse(prosopoPayload);

      await prosopoServer.isReady();
      return await prosopoServer.isVerified(prosopoOutput);
    } catch (e) {
      logger.error(`⭕ An error occurred when validating captcha`, e);
      return false;
    }
  }
}
