/**
 * This file contains queries for interacting with the channel table in the database.
 *
 * @author Ajay Gandecha <agandecha@unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { Channel } from "../models/channel";

export const getChannels = async (
  supabase: SupabaseClient,
  serverId: string
): Promise<z.infer<typeof Channel>[]> => {
  const query = supabase
    .from("channel")
    .select(`id, name`)
    .eq("server_id", serverId)
    .order("name", { ascending: true });

  const { data: channels, error } = await query;

  if (error) {
    throw new Error(`Error fetching channels: ${error.message}`);
  }

  return Channel.array().parse(channels);
};

export const createChannel = async (
  supabase: SupabaseClient,
  serverId: string,
  channelName: string
): Promise<void> => {
  const { error } = await supabase.from("channel").insert({
    server_id: serverId,
    name: channelName,
  });

  if (error) {
    throw new Error(`Error creating channel: ${error.message}`);
  }
};

export const editChannel = async (
  supabase: SupabaseClient,
  channel: z.infer<typeof Channel>
): Promise<void> => {
  const { error } = await supabase
    .from("channel")
    .update(channel)
    .eq("id", channel.id);

  if (error) {
    throw new Error(`Error updating channel: ${error.message}`);
  }
};

export const deleteChannel = async (
  supabase: SupabaseClient,
  channelId: string
): Promise<void> => {
  const { error } = await supabase.from("channel").delete().eq("id", channelId);

  if (error) {
    throw new Error(`Error deleting channel: ${error.message}`);
  }
};
