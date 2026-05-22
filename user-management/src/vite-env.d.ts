/// <reference types="vite/client" />

// 声明我们自定义的环境变量，让 import.meta.env.VITE_xxx 有类型提示
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
