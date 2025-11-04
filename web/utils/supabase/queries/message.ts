/**
 * This file contains queries for interacting with the message table in the database.
 *
 * @author Ajay Gandecha <agandecha@unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { DraftMessage, Message } from "../models/message";

export const getPaginatedMessages = async (
  supabase: SupabaseClient,
  channelId: string,
  cursor: number,
  textSearch?: string
): Promise<z.infer<typeof Message>[]> => {
  const query = supabase
    .from("message")
    .select(
      `
    id,
    content,
    created_at,
    attachment_url,
    author:profile!author_id ( id, display_name, username, avatar_url ),
    reactions:reaction!message_id ( id, reaction, profile_id )
  `
    )
    .eq("channel_id", channelId)
    .order("created_at", { ascending: false })
    .range(cursor, cursor + 49);

  if (textSearch) {
    query.textSearch("content", textSearch);
  }

  const { data: messages, error: messagesError } = await query;

  if (messagesError) {
    throw new Error(`Error fetching messages: ${messagesError.message}`);
  }

  return Message.array().parse(messages);
};

export const sendMessage = async (
  supabase: SupabaseClient,
  draftMessage: z.infer<typeof DraftMessage>,
  file: File | null
) => {
  const { data: message, error } = await supabase
    .from("message")
    .insert(draftMessage)
    .select(
      `
      id,
      content,
      created_at,
      attachment_url,
      author_id,
      channel_id
    `
    )
    .single();

  if (error) {
    throw new Error(`Error sending message: ${error.message}`);
  }

  if (file && message) {
    const { data: fileData, error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(`${message.id}`, file);

    if (uploadError) throw Error(uploadError.message);

    if (fileData) {
      const { data: updatedMessage, error } = await supabase
        .from("message")
        .update({
          attachment_url: supabase.storage
            .from("attachments")
            .getPublicUrl(fileData.path).data.publicUrl,
        })
        .eq("id", message.id)
        .select(
          `
            id,
            content,
            created_at,
            attachment_url,
            author_id,
            channel_id
          `
        )
        .single();
      if (error) throw Error(error.message);

      return DraftMessage.parse(updatedMessage);
    }
  }
  return DraftMessage.parse(message);
};

export const addReactionToMessage = async (
  supabase: SupabaseClient,
  channelId: string,
  messageId: string,
  emoji: string
) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData) throw Error("Error loading current user.");

  const { error } = await supabase.from("reaction").insert({
    message_id: messageId,
    profile_id: userData.user.id,
    channel_id: channelId,
    reaction: emoji,
  });

  if (error) {
    throw new Error(`Error adding reaction: ${error.message}`);
  }
};

export const removeReactionFromMessage = async (
  supabase: SupabaseClient,
  messageId: string,
  emoji: string
) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData) throw Error("Error loading current user.");

  const { error } = await supabase
    .from("reaction")
    .delete()
    .eq("message_id", messageId)
    .eq("profile_id", userData.user.id)
    .eq("reaction", emoji);

  if (error) {
    throw new Error(`Error removing reaction: ${error.message}`);
  }
};
