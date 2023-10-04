<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import Cross from "./icons/Cross.svelte";

  export let captchaKey: string;

  const dispatch = createEventDispatcher<{ token: string }>();

  const captchaId = "captcha_element";
  let captchaError: boolean = false;
  export let theme: "dark" | "light" | "auto" = "auto";

  let componentMounted: boolean;

  onMount(() => {
    window.captchaLoaded = () => {
      const colorTheme =
        theme === "auto"
          ? window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : theme;

      if (!window.procaptcha) {
        captchaError = true;
        throw new Error("procaptcha is undefined!");
      }
      window.procaptcha.render(captchaId, {
        siteKey: captchaKey,
        theme: colorTheme,
        callback: "onToken",
      });
    };

    window.onToken = (token) => {
      dispatch("token", token);
    };

    // clean the token so the form becomes invalid
    window.onExpiredToken = () => {
      dispatch("token", "");
    };

    // once we have mounted all the required methods, we import the script
    componentMounted = true;
    captchaError = false;
  });
</script>

<svelte:head>
  {#if componentMounted}
    <script src="procaptcha.bundle.js?render=implicit&onload=captchaLoaded" async defer></script>
  {/if}
</svelte:head>

{#if captchaError}
  <div class="alert alert-error shadow-lg" data-testid="error">
    <div>
      <Cross />
      <span>Error loading Google Captcha. Please reload the page.</span>
    </div>
  </div>
{/if}
<div id={captchaId} />
