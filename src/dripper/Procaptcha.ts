import { getServerConfig, ProsopoServer } from "@prosopo/server";
import { ProcaptchaOutput } from "@prosopo/types";

import { logger } from "../logger";

export class Procaptcha {
  async validate(captcha: string): Promise<boolean> {
    try {
      const prosopoOutput = JSON.parse(captcha) as ProcaptchaOutput;
      const config = getServerConfig();

      console.log(config, "config \n\n\n config -----------------");

      const prosopoServer = new ProsopoServer(config);

      await prosopoServer.isReady();

      const captchaResult = await prosopoServer.isVerified(prosopoOutput);
      if (captchaResult) return true;
      logger.debug("Negative procaptcha validation result", captchaResult);
      return false;
    } catch (e) {
      logger.error(`⭕ An error occurred when validating captcha`, e);
      return false;
    }
  }
}
