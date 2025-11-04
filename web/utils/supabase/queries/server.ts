/**
 * This file contains queries for interacting with the server table in the database.
 *
 * @author Ajay Gandecha <agandecha@unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { EditedServer, Server } from "../models/server";
import { Profile } from "../models/profile";
import { createChannel } from "./channel";

export const getServers = async (
  supabase: SupabaseClient
): Promise<z.infer<typeof Server>[]> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData) throw Error("Error loading current user.");

  const { data: memberServers, error: memberServersError } = await supabase
    .from("server_membership")
    .select("server_id")
    .eq("profile_id", userData.user.id);

  if (memberServersError) {
    throw new Error(
      `Error fetching member servers: ${memberServersError.message}`
    );
  }

  const query = supabase
    .from("server")
    .select(
      `id, name, server_image_url, server_creator_id, channels:channel!server_id (id, name)`
    )
    .in(
      "id",
      memberServers.map((server) => server.server_id)
    )
    .order("name", { ascending: true })
    .order("name", { referencedTable: "channels", ascending: true });

  const { data: servers, error: serverError } = await query;

  if (serverError) {
    throw new Error(`Error fetching servers: ${serverError.message}`);
  }

  return Server.array().parse(servers);
};

export const getServerMembers = async (
  supabase: SupabaseClient,
  serverId: string
) => {
  const query = supabase
    .from("server_membership")
    .select(
      `profile:profile!profile_id (id, display_name, username, avatar_url)`
    )
    .eq("server_id", serverId);

  const { data: serverMembers, error: serverMembersError } = await query;

  if (serverMembersError) {
    throw new Error(
      `Error fetching server members: ${serverMembersError.message}`
    );
  }

  const members = z
    .object({
      profile: Profile,
    })
    .array()
    .parse(serverMembers);
  return members.map((member) => member.profile);
};

export const getServer = async (
  supabase: SupabaseClient,
  serverId: string
): Promise<z.infer<typeof Server> | null> => {
  const query = supabase
    .from("server")
    .select(
      `id, name, server_image_url, server_creator_id, channels:channel!server_id (id, name)`
    )
    .eq("id", serverId)
    .single();

  const { data: server, error: serverError } = await query;

  if (serverError) {
    throw new Error(`Error fetching server: ${serverError.message}`);
  }

  return server ? Server.parse(server) : null;
};

export const renameServer = async (
  supabase: SupabaseClient,
  editedServer: z.infer<typeof EditedServer>
): Promise<void> => {
  const { error: updateError } = await supabase
    .from("server")
    .update({
      name: editedServer.name,
    })
    .eq("id", editedServer.id);

  if (updateError) {
    throw new Error(`Error updating server: ${updateError.message}`);
  }
};

export const deleteServer = async (
  supabase: SupabaseClient,
  serverId: string
): Promise<void> => {
  const { error: deleteError } = await supabase
    .from("server")
    .delete()
    .eq("id", serverId);

  if (deleteError) {
    throw new Error(`Error deleting server: ${deleteError.message}`);
  }
};

export const createServer = async (
  supabase: SupabaseClient,
  serverName: string
): Promise<z.infer<typeof Server>> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData) throw Error("Error loading current user.");

  const { data: createdServerData, error: createError } = await supabase
    .from("server")
    .insert({
      name: serverName,
      server_creator_id: userData.user.id,
    })
    .select(
      `id, name, server_image_url, server_creator_id, channels:channel!server_id (id, name)`
    )
    .single();

  if (createError) {
    throw new Error(`Error creating server: ${createError.message}`);
  }

  const createdServer = Server.parse(createdServerData);

  // Create first channel
  await createChannel(supabase, createdServer.id, "general");

  // Add user to server
  await joinServer(supabase, createdServer.id);

  const finalServer = await getServer(supabase, createdServer.id);

  if (!finalServer) {
    throw new Error(`Error fetching created server`);
  }

  return finalServer;
};

export const changeServerImage = async (
  supabase: SupabaseClient,
  serverId: string,
  file: File
): Promise<void> => {
  const { data: fileData, error: uploadError } = await supabase.storage
    .from("server-images")
    .update(`${file.name}`, file, { upsert: true });

  if (uploadError) throw Error(uploadError.message);

  const { error: updateError } = await supabase
    .from("server")
    .update({
      server_image_url: supabase.storage
        .from("server-images")
        .getPublicUrl(fileData.path, {
          transform: {
            width: 300,
            height: 300,
          },
        }).data.publicUrl,
    })
    .eq("id", serverId);

  if (updateError) {
    throw new Error(`Error updating server image: ${updateError.message}`);
  }
};

export const joinServer = async (
  supabase: SupabaseClient,
  serverId: string
): Promise<z.infer<typeof Server>> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData) throw Error("Error loading current user.");

  const { error: membershipError } = await supabase
    .from("server_membership")
    .insert({
      server_id: serverId,
      profile_id: userData.user.id,
    });

  if (membershipError) {
    throw new Error(`Error joining server: ${membershipError.message}`);
  }

  const finalServer = await getServer(supabase, serverId);

  if (!finalServer) {
    throw new Error(`Error fetching joined server`);
  }

  return finalServer;
};

export const leaveServer = async (
  supabase: SupabaseClient,
  serverId: string
): Promise<void> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData) throw Error("Error loading current user.");

  const { error: membershipError } = await supabase
    .from("server_membership")
    .delete()
    .eq("server_id", serverId)
    .eq("profile_id", userData.user.id);

  if (membershipError) {
    throw new Error(`Error leaving server: ${membershipError.message}`);
  }
};
