import { Procaptcha } from "./Procaptcha";

describe("Procaptcha", () => {
  it("Validates captcha positively", async () => {
    const procaptcha = new Procaptcha();
    const result = await procaptcha.validate(
      `{
        "user": "5GC7xAfXVHWU92xVW5CqLh1rNToADTCTDzvkp3tUxKvVejfA",
        "dapp": "5HUBceb4Du6dvMA9BiwN5VzUrzUsX9Zp7z7nSR2cC1TCv5jg",
        "providerUrl": "https://pronode3.prosopo.io",
        "blockNumber": "3505597",
        "commitmentId": "0x5318dac872472f99042bc300d3c96b6cc2cf42e0a18bc520823e0eb1654940f6"
      }`,
    );
    expect(result).toBeTruthy();
  });

  it("Validates captcha negatively", async () => {
    const procaptcha = new Procaptcha();
    const result = await procaptcha.validate(
      `{
        "user": "5HUBceb4Du6dvMA9BiwN5VzUrzUsX9Zp7z7nSR2cC1TCv5jg",
        "dapp": "5HUBceb4Du6dvMA9BiwN5VzUrzUsX9Zp7z7nSR2cC1TCv5jg",
        "providerUrl": "https://fakenode.prosopo.io",
        "blockNumber": "3505597"
      }`,
    );

    console.log(process.env);
    expect(result).toBeFalsy();
  });
});
