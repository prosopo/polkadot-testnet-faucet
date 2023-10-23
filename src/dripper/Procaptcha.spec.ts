import { Procaptcha } from "./Procaptcha";

const VALID_CAPTCHA = `{
  "user": "5HTfKn4aJNmMqaCxJeQyhBJrLxVyvJbomNWFnAr8xw4EnFxQ",
  "dapp": "5HUBceb4Du6dvMA9BiwN5VzUrzUsX9Zp7z7nSR2cC1TCv5jg",
  "providerUrl": "https://pronode2.prosopo.io",
  "blockNumber": "3604097"
}`;

const INVALID_CAPTCHA = `{
  "user": "5HTfKn4aJNmMqaCxJeQyhBJrLxVyvJbomNWFnAr8xw4EnFxQ",
  "dapp": "5HUBceb4Du6dvMA9BiwN5VzUrzUsX9Zp7z7nSR2cC1TCv5jg",
  "providerUrl": "https://pronode2.prosopo.io",
  "blockNumber": "0000000"
}`;

describe("Procaptcha", () => {
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
