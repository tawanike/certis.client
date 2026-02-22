import { api } from "@/lib/api"
import type { LLMSettings, LLMSettingsUpdate } from "@/types/settings"

export const settingsService = {
  getLLMSettings(): Promise<LLMSettings> {
    return api.get<LLMSettings>("/settings/llm")
  },

  updateLLMSettings(update: LLMSettingsUpdate): Promise<LLMSettings> {
    return api.patch<LLMSettings>("/settings/llm", update)
  },
}
