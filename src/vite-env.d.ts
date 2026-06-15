/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module "virtual:pwa-entry-point-loaded" {
  const registerDevSW: () => void;
  export default registerDevSW;
}
