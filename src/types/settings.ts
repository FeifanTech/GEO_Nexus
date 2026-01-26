// System Settings Types

export interface SystemSettings {
  // Dify Configuration
  difyApiKey: string;
  difyBaseUrl: string;
  
  // General Settings
  companyName: string;
  defaultBrand: string;
  
  // Monitoring Settings
  defaultModels: string[];
  autoExecuteOnCreate: boolean;
  
  // UI Settings
  language: "zh-CN" | "en-US";
  theme: "light" | "dark" | "system";
  
  // Data Settings
  dataRetentionDays: number;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  difyApiKey: "",
  difyBaseUrl: "https://api.dify.ai/v1",
  companyName: "",
  defaultBrand: "",
  defaultModels: ["qwen", "kimi", "gpt4"],
  autoExecuteOnCreate: true,
  language: "zh-CN",
  theme: "light",
  dataRetentionDays: 90,
};
