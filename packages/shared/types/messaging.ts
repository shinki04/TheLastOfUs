import { Tables } from "./database.types";

// Message types
export type Message = Tables<"messages">;
export type Conversation = Tables<"conversations">;
export type ConversationMember = Tables<"conversation_members">;

export type ConversationType = "direct" | "group";
export type MessageType = "text" | "image" | "file" | "system";

// Message status for optimistic UI
export type MessageStatus = "sending" | "sent" | "failed";

// Extended message type for optimistic UI
export interface OptimisticMessage extends Partial<Message> {
  tempId: string; // Temporary ID for matching after server response
  status: MessageStatus;
  error?: string;
  retryCount?: number;
  sender?: Tables<"profiles">;
  reply_to?: ReplyToMessage;
}

// Conversation with extra details
export interface ConversationWithDetails extends Conversation {
  members: (ConversationMember & {
    profile: Tables<"profiles">;
  })[];
  lastMessage?: Message & {
    sender?: Tables<"profiles">;
  };
  unreadCount?: number;
}

// Simplified reply message info for display
export interface ReplyToMessage {
  id: string;
  content: string | null;
  sender_id: string | null;
  sender?: Tables<"profiles">;
  is_deleted?: boolean | null;
}

// Message with sender profile and optional reply_to
export interface MessageWithSender extends Message {
  sender?: Tables<"profiles">;
  reply_to?: ReplyToMessage;
}

// For creating new messages
export interface SendMessageInput {
  conversationId: string;
  content: string;
  messageType?: MessageType;
}

// For creating conversations
export interface CreateGroupInput {
  name: string;
  memberIds: string[];
}
