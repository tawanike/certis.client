"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { settingsService } from "@/services/settings.service"
import type { LLMSettings, LLMSettingsUpdate, LLMProvider } from "@/types/settings"

const PROVIDERS: { value: LLMProvider; label: string }[] = [
  { value: "ollama", label: "Ollama (Local)" },
  { value: "openai", label: "OpenAI" },
  { value: "azure_openai", label: "Azure OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "azure_foundry", label: "Azure AI Foundry" },
]

const EMBEDDING_PROVIDERS: { value: LLMProvider; label: string }[] = [
  { value: "ollama", label: "Ollama (Local)" },
  { value: "openai", label: "OpenAI" },
  { value: "azure_openai", label: "Azure OpenAI" },
]

type RoleKey = "primary" | "secondary" | "chat" | "vision" | "suggestions" | "embedding"

const ROLES: { key: RoleKey; label: string; description: string }[] = [
  { key: "primary", label: "Primary", description: "Claims, Risk, Spec, QA, Intent (JSON mode)" },
  { key: "secondary", label: "Secondary", description: "Retries, rewrites, fast edits" },
  { key: "chat", label: "Chat", description: "Conversational chat stream" },
  { key: "vision", label: "Vision", description: "Diagram and chart interpretation" },
  { key: "suggestions", label: "Suggestions", description: "Contextual suggested actions (JSON mode)" },
  { key: "embedding", label: "Embedding", description: "RAG, case law, prior art search" },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<LLMSettings | null>(null)
  const [draft, setDraft] = useState<LLMSettingsUpdate>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    settingsService.getLLMSettings().then((data) => {
      setSettings(data)
    }).catch((err) => {
      setError(err.message)
    })
  }, [])

  const handleProviderChange = (role: RoleKey, provider: string) => {
    setDraft((prev) => ({ ...prev, [`provider_${role}`]: provider }))
  }

  const handleModelChange = (role: RoleKey, model: string) => {
    setDraft((prev) => ({ ...prev, [`model_${role}`]: model }))
  }

  const getEffectiveProvider = (role: RoleKey): LLMProvider => {
    const draftKey = `provider_${role}` as keyof LLMSettingsUpdate
    return (draft[draftKey] as LLMProvider) || settings?.[role]?.provider || "ollama"
  }

  const getEffectiveModel = (role: RoleKey): string => {
    const draftKey = `model_${role}` as keyof LLMSettingsUpdate
    return (draft[draftKey] as string) || settings?.[role]?.model || ""
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const updated = await settingsService.updateLLMSettings(draft)
      setSettings(updated)
      setDraft({})
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const hasDraftChanges = Object.keys(draft).length > 0

  if (!settings && !error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure LLM providers and models for each role in the patent drafting pipeline.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          Settings saved successfully.
        </div>
      )}

      {/* LLM Role Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>LLM Configuration</CardTitle>
          <CardDescription>
            Select a provider and model for each pipeline role. Changes take effect immediately after saving.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {ROLES.map(({ key, label, description }) => {
            const providers = key === "embedding" ? EMBEDDING_PROVIDERS : PROVIDERS
            return (
              <div key={key} className="grid gap-3 rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`provider-${key}`}>Provider</Label>
                    <Select
                      value={getEffectiveProvider(key)}
                      onValueChange={(v) => handleProviderChange(key, v)}
                    >
                      <SelectTrigger id={`provider-${key}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`model-${key}`}>Model</Label>
                    <Input
                      id={`model-${key}`}
                      value={getEffectiveModel(key)}
                      onChange={(e) => handleModelChange(key, e.target.value)}
                      placeholder="Model name"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Provide API keys for cloud providers. Keys are stored securely and never displayed after saving.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OpenAI */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              {settings?.openai_api_key_set && (
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                  Configured
                </span>
              )}
            </div>
            <Input
              id="openai-key"
              type="password"
              placeholder={settings?.openai_api_key_set ? "••••••••" : "sk-..."}
              value={draft.openai_api_key || ""}
              onChange={(e) => setDraft((prev) => ({ ...prev, openai_api_key: e.target.value }))}
            />
          </div>

          {/* Azure OpenAI */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="azure-openai-key">Azure OpenAI API Key</Label>
              {settings?.azure_openai_api_key_set && (
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                  Configured
                </span>
              )}
            </div>
            <Input
              id="azure-openai-key"
              type="password"
              placeholder={settings?.azure_openai_api_key_set ? "••••••••" : "Azure OpenAI key"}
              value={draft.azure_openai_api_key || ""}
              onChange={(e) => setDraft((prev) => ({ ...prev, azure_openai_api_key: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="azure-openai-endpoint">Azure OpenAI Endpoint</Label>
            <Input
              id="azure-openai-endpoint"
              placeholder={settings?.azure_openai_endpoint || "https://your-resource.openai.azure.com/"}
              value={draft.azure_openai_endpoint || ""}
              onChange={(e) => setDraft((prev) => ({ ...prev, azure_openai_endpoint: e.target.value }))}
            />
          </div>

          {/* Anthropic */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="anthropic-key">Anthropic API Key</Label>
              {settings?.anthropic_api_key_set && (
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                  Configured
                </span>
              )}
            </div>
            <Input
              id="anthropic-key"
              type="password"
              placeholder={settings?.anthropic_api_key_set ? "••••••••" : "sk-ant-..."}
              value={draft.anthropic_api_key || ""}
              onChange={(e) => setDraft((prev) => ({ ...prev, anthropic_api_key: e.target.value }))}
            />
          </div>

          {/* Azure AI Foundry */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="azure-foundry-key">Azure AI Foundry API Key</Label>
              {settings?.azure_foundry_api_key_set && (
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                  Configured
                </span>
              )}
            </div>
            <Input
              id="azure-foundry-key"
              type="password"
              placeholder={settings?.azure_foundry_api_key_set ? "••••••••" : "Azure Foundry key"}
              value={draft.azure_foundry_api_key || ""}
              onChange={(e) => setDraft((prev) => ({ ...prev, azure_foundry_api_key: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="azure-foundry-endpoint">Azure AI Foundry Endpoint</Label>
            <Input
              id="azure-foundry-endpoint"
              placeholder={settings?.azure_foundry_endpoint || "https://your-foundry-endpoint.azure.com/"}
              value={draft.azure_foundry_endpoint || ""}
              onChange={(e) => setDraft((prev) => ({ ...prev, azure_foundry_endpoint: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || !hasDraftChanges}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
