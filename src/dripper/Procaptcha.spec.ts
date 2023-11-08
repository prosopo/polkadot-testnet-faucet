import { ApiPaths, ProcaptchaOutput } from "@prosopo/types";
import axios from "axios";

import { Procaptcha } from "./Procaptcha";

// Alice's address
const VALID_CAPTCHA = `{
  "user": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "dapp": "5HUBceb4Du6dvMA9BiwN5VzUrzUsX9Zp7z7nSR2cC1TCv5jg",
  "providerUrl": "https://mockprovider.app.runonflux.io/",
  "blockNumber": "3604097"
}`;

// Bob's address
const INVALID_CAPTCHA = `{
  "user": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
  "dapp": "5HUBceb4Du6dvMA9BiwN5VzUrzUsX9Zp7z7nSR2cC1TCv5jg",
  "providerUrl": "https://mockprovider.app.runonflux.io/",
  "blockNumber": "0000000"
}`;

// This is a mock of the @prosopo/server function isVerified that prevents calling out to a contract. A call to a test
// provider API is still made.
const mockValidationFn = async (payload: ProcaptchaOutput) => {
  const { user, providerUrl, commitmentId } = payload;
  if (!providerUrl) {
    throw new Error("No providerUrl provided");
  }
  const params = { user, commitmentId };
  const url = new URL(ApiPaths.VerifyCaptchaSolution, providerUrl).href;
  const result = await axios.post(url, params);
  return result.data.solutionApproved;
};

describe("Procaptcha", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(Procaptcha.prototype, "getValidator").mockImplementation(() => {
      return { isVerified: mockValidationFn, isReady: () => true };
    });
  });

  afterAll((done) => {
    jest.restoreAllMocks();
    done();
  });

  it("Validates captcha positively", async () => {
    const procaptcha = new Procaptcha();
    const result = await procaptcha.validate(VALID_CAPTCHA);
    expect(result).toBeTruthy();
  });

  it("Validates captcha negatively", async () => {
    const procaptcha = new Procaptcha();
    const result = await procaptcha.validate(INVALID_CAPTCHA);
    expect(result).toBeFalsy();
  });
});
