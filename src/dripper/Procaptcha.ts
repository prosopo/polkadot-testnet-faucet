import { getServerConfig, ProsopoServer } from "@prosopo/server";
import { ProcaptchaOutput } from "@prosopo/types";

import { config } from "src/config";

import { logger } from "../logger";

export class Procaptcha {
  constructor(private readonly maxVerifiedTime: number = Number(config.Get("PROSOPO_MAX_VERIFIED_TIME"))) {
    if (!this.maxVerifiedTime) {
      this.maxVerifiedTime = 60000;
    }
  }

  getValidator() {
    return new ProsopoServer(getServerConfig());
  }

  private parseOutput(captcha: string): ProcaptchaOutput {
    return JSON.parse(captcha) as ProcaptchaOutput;
  }

  async validate(captcha: string, maxVerifiedTime?: number): Promise<boolean> {
    try {
      const prosopoOutput = this.parseOutput(captcha);
      const prosopoServer = this.getValidator();
      await prosopoServer.isReady();
      return await prosopoServer.isVerified(prosopoOutput, maxVerifiedTime || this.maxVerifiedTime);
    } catch (e) {
      logger.error(`⭕ An error occurred when validating captcha`, e);
      return false;
    }
  }
}
