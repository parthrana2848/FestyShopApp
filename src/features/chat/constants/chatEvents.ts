export const CHAT_EVENTS = {
  CHAT_JOIN: 'chat:join',
  CHAT_LEAVE: 'chat:leave',
  MESSAGE_SEND: 'message:send',
  MESSAGE_NEW: 'message:new',
  CHAT_ERROR: 'chat:error',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_READ: 'message:read',
  REACTION_ADD: 'reaction:add',
  REACTION_REMOVE: 'reaction:remove',
  REACTION_ADDED: 'reaction:added',
  REACTION_REMOVED: 'reaction:removed',
} as const;
