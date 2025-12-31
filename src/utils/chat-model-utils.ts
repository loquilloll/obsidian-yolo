import { ChatModel } from '../types/chat-model.types'

export function isChatModelEnabled(model: ChatModel): boolean {
  return model.enable ?? true
}

export function getFirstEnabledChatModelId(
  chatModels: ChatModel[],
): string | undefined {
  return chatModels.find(isChatModelEnabled)?.id ?? chatModels[0]?.id
}

export function resolveEnabledChatModelId(
  chatModels: ChatModel[],
  preferredId: string,
): string {
  const preferredModel = chatModels.find((model) => model.id === preferredId)
  if (preferredModel && isChatModelEnabled(preferredModel)) {
    return preferredId
  }

  return getFirstEnabledChatModelId(chatModels) ?? preferredId
}
