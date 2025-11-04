/**
 * All Zod models to represent channel data.
 *
 * @author Ajay Gandecha <agandecha@unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import { z } from "zod";

export const Channel = z.object({
  id: z.string(),
  name: z.string(),
});
