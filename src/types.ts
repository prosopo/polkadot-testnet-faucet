export type TypeofMap = {
  string: string;
  number: number;
  boolean: boolean;
};
export type PrimitivTypeString = keyof TypeofMap;

export type PrimitivType = string | number | boolean;

export interface MetricsDefinition {
  meta: {
    prefix: string;
  };
  data: { [id: string]: number };
}

export interface EnvOpt {
  default?: PrimitivType;
  required: boolean;
  secret: boolean;
  type: PrimitivTypeString;
}

export interface BalanceResponse {
  balance: string;
}

export interface DripErrorResponse {
  error: string;
}

export interface DripSuccessResponse {
  hash: string;
}

export type DripResponse = DripErrorResponse | DripSuccessResponse;

export enum CaptchaProvider {
  procaptcha = "procaptcha",
  recaptcha = "recaptcha",
}

export type DripRequestType = {
  address: string;
  amount: bigint;
  parachain_id: string;
  sender?: string;
  captchaResponse?: string;
};

export interface BotRequestType {
  address: string;
  amount: string;
  parachain_id: string;
  sender?: string;
}

export type FaucetRequestType = {
  address: string;
  parachain_id: string;
  captchaResponse?: string;
};
