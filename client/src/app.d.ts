// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }

  declare interface Window {
    procaptcha?: Captcha;
    captchaLoaded: () => void;
    onToken: (token: string) => void;
    onExpiredToken: () => void;
  }
}

interface Captcha {
  render: (
    element: string,
    key: {
      siteKey: string;
      callback?: string;
      theme?: "light" | "dark";
      "chalexpired-callback"?: string;
    },
  ) => void;
  default: (callback: () => void) => void;
}

export {};
