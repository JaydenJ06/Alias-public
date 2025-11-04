/**
 * All Zod models to represent profile data.
 *
 * @author Ajay Gandecha <agandecha@unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import { z } from "zod";

export const Profile = z.object({
  id: z.string(),
  display_name: z.string(),
  username: z.string(),
  avatar_url: z.string().nullable(),
});
