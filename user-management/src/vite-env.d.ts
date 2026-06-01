/// <reference types="vite/client" />

// 声明我们自定义的环境变量，让 import.meta.env.VITE_xxx 有类型提示
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_TITLE: string;
  // 值始终是字符串（'true' / 'false'），不是 boolean —— Vite 不做类型转换
  readonly VITE_USE_MOCK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
