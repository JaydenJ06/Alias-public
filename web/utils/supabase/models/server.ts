/**
 * All Zod models to represent server data.
 *
 * @author Ajay Gandecha <agandecha@unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import { z } from "zod";
import { Channel } from "./channel";

export const Server = z.object({
  id: z.string(),
  name: z.string(),
  server_image_url: z.string().nullable(),
  channels: Channel.array(),
  server_creator_id: z.string(),
});

export const EditedServer = Server.omit({
  channels: true,
  server_creator_id: true,
});
