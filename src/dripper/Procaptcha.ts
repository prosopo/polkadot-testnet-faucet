import { getServerConfig, ProsopoServer } from "@prosopo/server";
import { ProcaptchaOutput } from "@prosopo/types";

import { logger } from "../logger";

export class Procaptcha {
  getValidator() {
    return new ProsopoServer(getServerConfig());
  }

  private parseOutput(captcha: string): ProcaptchaOutput {
    return JSON.parse(captcha) as ProcaptchaOutput;
  }

  async validate(captcha: string): Promise<boolean> {
    try {
      const prosopoOutput = this.parseOutput(captcha);
      const prosopoServer = this.getValidator();
      await prosopoServer.isReady();
      return await prosopoServer.isVerified(prosopoOutput);
    } catch (e) {
      logger.error(`⭕ An error occurred when validating captcha`, e);
      return false;
    }
  }
}
