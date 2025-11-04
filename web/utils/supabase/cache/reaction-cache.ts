/**
 * This file contains utility functions for updating the reaction data
 * cached by React Query.
 *
 * @author Ajay Gandecha <ajay@cs.unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import { z } from "zod";
import { Message, MessageReaction } from "../models/message";
import { InfiniteData, QueryClient } from "@tanstack/react-query";

/** Generates a function that adds a reaction to the cache. */
export const addReactionToCacheFn =
  (queryUtils: QueryClient, channelId: string | string[] | undefined) =>
  (messageId: string, reaction: z.infer<typeof MessageReaction>) => {
    queryUtils.setQueryData(
      ["messages", channelId],
      (oldData: InfiniteData<z.infer<typeof Message>[]>) => {
        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) =>
            page.map((message) =>
              message.id === messageId
                ? {
                    ...message,
                    reactions: [...message.reactions, reaction],
                  }
                : message
            )
          ),
        };
      }
    );
  };

/** Generates a function that removes a reaction from the cache. */
export const removeReactionFromCacheFn =
  (queryUtils: QueryClient, channelId: string | string[] | undefined) =>
  (reactionId: string) => {
    queryUtils.setQueryData(
      ["messages", channelId],
      (oldData: InfiniteData<z.infer<typeof Message>[]>) => {
        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) =>
            page.map((message) => ({
              ...message,
              reactions: message.reactions.filter(
                (reaction) => reaction.id !== reactionId
              ),
            }))
          ),
        };
      }
    );
  };
