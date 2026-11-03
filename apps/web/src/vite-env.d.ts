/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMPILER_GATEWAY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
