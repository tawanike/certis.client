export type LLMProvider = "ollama" | "openai" | "azure_openai" | "anthropic" | "azure_foundry"

export interface LLMRoleConfig {
  provider: LLMProvider
  model: string
}

export interface LLMSettings {
  primary: LLMRoleConfig
  secondary: LLMRoleConfig
  chat: LLMRoleConfig
  vision: LLMRoleConfig
  suggestions: LLMRoleConfig
  embedding: LLMRoleConfig
  openai_api_key_set: boolean
  azure_openai_api_key_set: boolean
  azure_openai_endpoint: string | null
  anthropic_api_key_set: boolean
  azure_foundry_api_key_set: boolean
  azure_foundry_endpoint: string | null
}

export interface LLMSettingsUpdate {
  provider_primary?: string
  provider_secondary?: string
  provider_chat?: string
  provider_vision?: string
  provider_suggestions?: string
  provider_embedding?: string
  model_primary?: string
  model_secondary?: string
  model_chat?: string
  model_vision?: string
  model_suggestions?: string
  model_embedding?: string
  openai_api_key?: string
  azure_openai_api_key?: string
  azure_openai_endpoint?: string
  anthropic_api_key?: string
  azure_foundry_api_key?: string
  azure_foundry_endpoint?: string
}
