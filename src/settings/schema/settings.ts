import { SETTINGS_SCHEMA_VERSION, SETTING_MIGRATIONS } from './migrations'
import {
  SmartComposerSettings,
  smartComposerSettingsSchema,
} from './setting.types'
import { resolveEnabledChatModelId } from '../../utils/chat-model-utils'

function migrateSettings(
  data: Record<string, unknown>,
): Record<string, unknown> {
  let currentData = { ...data }
  let currentVersion = (currentData.version as number) ?? 0

  for (const migration of SETTING_MIGRATIONS) {
    if (
      currentVersion >= migration.fromVersion &&
      currentVersion < migration.toVersion &&
      migration.toVersion <= SETTINGS_SCHEMA_VERSION
    ) {
      console.debug(
        `Migrating settings from ${migration.fromVersion} to ${migration.toVersion}`,
      )
      currentData = migration.migrate(currentData)
      currentVersion = migration.toVersion
    }
  }

  return currentData
}

export function parseSmartComposerSettings(
  data: unknown,
): SmartComposerSettings {
  try {
    const migratedData = migrateSettings(data as Record<string, unknown>)
    const parsed = smartComposerSettingsSchema.parse(migratedData)
    const chatModelId = resolveEnabledChatModelId(
      parsed.chatModels,
      parsed.chatModelId,
    )
    const applyModelId = resolveEnabledChatModelId(
      parsed.chatModels,
      parsed.applyModelId,
    )
    return {
      ...parsed,
      version: SETTINGS_SCHEMA_VERSION,
      chatModelId,
      applyModelId,
    }
  } catch (error) {
    console.warn('Invalid settings provided, using defaults:', error)
    const defaults = smartComposerSettingsSchema.parse({})
    const chatModelId = resolveEnabledChatModelId(
      defaults.chatModels,
      defaults.chatModelId,
    )
    const applyModelId = resolveEnabledChatModelId(
      defaults.chatModels,
      defaults.applyModelId,
    )
    return {
      ...defaults,
      version: SETTINGS_SCHEMA_VERSION,
      chatModelId,
      applyModelId,
    }
  }
}
