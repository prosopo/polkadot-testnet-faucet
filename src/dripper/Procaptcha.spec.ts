import { Procaptcha } from "./Procaptcha";

describe("Procaptcha", () => {
  it("Validates captcha positively", async () => {
    const procaptcha = new Procaptcha();
    const result = await procaptcha.validate("something");
    expect(result).toBeTruthy();
  });

  it("Validates captcha negatively", async () => {
    const procaptcha = new Procaptcha();
    const result = await procaptcha.validate("something");
    expect(result).toBeFalsy();
  });
});
