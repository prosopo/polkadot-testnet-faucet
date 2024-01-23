import { validatedFetch } from "@eng-automation/js";
import Joi from "joi";
import {RandomProvider} from "@prosopo/captcha-contract";

export async function drip(webEndpoint: string, address: string, parachainId?: string, procaptchaEndpoint?: string, randomProvider?: RandomProvider): Promise<{
  hash: string
}> {
  // Block number is used by the server to check that the captcha provider was actually selected by the captcha contract
  // during the frontend contract read.
  const blockNumber = randomProvider ? parseInt(randomProvider.blockNumber.toString()) : 0;

  const captchaResponse = JSON.stringify({
    user: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    dapp: "5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM",
    providerUrl: procaptchaEndpoint,
    provider: "5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM",
    blockNumber: blockNumber
  })
  console.log("Captcha response", captchaResponse)
  const body: { address: string, captchaResponse: string, parachain_id?: string } = {
    address: address,
    captchaResponse
  };
  if (parachainId) {
    body.parachain_id = parachainId;
  }

  return await validatedFetch<{
    hash: string;
  }>(`${webEndpoint}/drip/web`, Joi.object({ hash: Joi.string() }), {
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  });
}
