/**
 * This file contains utility functions for updating the message data
 * cached by React Query.
 *
 * @author Ajay Gandecha <ajay@cs.unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import { z } from "zod";
import { DraftMessage, Message } from "../models/message";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { Profile } from "../models/profile";

/** Generates a function that adds a message to the cache. */
export const addMessageToCacheFn =
  (
    queryUtils: QueryClient,
    channelId: string | string[] | undefined,
    members: z.infer<typeof Profile>[] | undefined
  ) =>
  (newMessage: z.infer<typeof DraftMessage>) => {
    queryUtils.setQueryData(
      ["messages", channelId],
      (oldData: InfiniteData<z.infer<typeof Message>[]>) => {
        const user = members?.find(
          (member) => member.id === newMessage.author_id
        );

        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page, index) =>
            index === 0
              ? [Message.parse({ author: user, ...newMessage }), ...page]
              : page
          ),
        };
      }
    );
  };

/** Generates a function that updates a message in the cache. */
export const updateMessageInCacheFn =
  (
    queryUtils: QueryClient,
    channelId: string | string[] | undefined,
    members: z.infer<typeof Profile>[] | undefined
  ) =>
  (updatedMessage: z.infer<typeof DraftMessage>) => {
    queryUtils.setQueryData(
      ["messages", channelId],
      (oldData: InfiniteData<z.infer<typeof Message>[]>) => {
        const user = members?.find(
          (member) => member.id === updatedMessage.author_id
        );

        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) =>
            page.map((message) =>
              message.id === updatedMessage.id
                ? Message.parse({ author: user, ...updatedMessage })
                : message
            )
          ),
        };
      }
    );
  };

/** Generates a function that deletes a message from the cache. */
export const deleteMessageFromCacheFn =
  (queryUtils: QueryClient, channelId: string | string[] | undefined) =>
  (messageId: string) => {
    queryUtils.setQueryData(
      ["messages", channelId],
      (oldData: InfiniteData<z.infer<typeof Message>[]>) => {
        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) =>
            page.filter((message) => message.id !== messageId)
          ),
        };
      }
    );
  };
