/**
 * View that represents an individual message.
 *
 * @author Ajay Gandecha <ajay@cs.unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import { Message, MessageReaction } from "@/utils/supabase/models/message";
import ProfileAvatar from "../profile/profile-avatar";
import ProfilePopover from "../profile/profile-popover";
import { z } from "zod";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger } from "../ui/popover";
import EmojiPopoverContent from "./emoji-popover-content";
import { User } from "@supabase/supabase-js";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Profile } from "@/utils/supabase/models/profile";
import { ScrollArea } from "../ui/scroll-area";

type MessageViewProps = {
  user: User;
  channelMembers: z.infer<typeof Profile>[];
  message: z.infer<typeof Message>;
  onReactionAdd: (emoji: string) => void;
  onReactionRemove: (emoji: string) => void;
};
export default function MessageView({
  user,
  channelMembers,
  message,
  onReactionAdd,
  onReactionRemove,
}: MessageViewProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [reactionsPopoverOpen, setReactionsPopoverOpen] = useState(false);

  // Determine the reactions that the user has.
  const userReactions = new Set(
    message.reactions
      .filter((r) => r.profile_id === user.id)
      .map((r) => r.reaction)
  );

  // Determine the reactions that only other users have.
  // To prevent this from being computationally expensive on rerender, this
  // can be memoized.
  const otherReactions = new Set(
    message.reactions
      .filter((r) => r.profile_id !== user.id && !userReactions.has(r.reaction))
      .map((r) => r.reaction)
  );

  // Group reactions by reaction text.
  // To prevent this from being computationally expensive on rerender, this
  // can be memoized.
  const groupedReactions = useMemo(() => {
    const groups: { [key: string]: z.infer<typeof MessageReaction>[] } = {};
    message.reactions.forEach((reaction) => {
      if (!groups[reaction.reaction]) {
        groups[reaction.reaction] = [];
      }
      groups[reaction.reaction].push(reaction);
    });
    return groups;
  }, [message.reactions]);

  return (
    <div
      className="flex flex-row w-full gap-3 p-2 hover:bg-accent rounded-lg"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <ProfileAvatar
        profile={channelMembers.find((m) => m.id === message.author.id)}
      />
      <div className="flex flex-col grow gap-1">
        <div className="flex flex-row items-center gap-2">
          <ProfilePopover profile={message.author} side="top" align="start">
            <p className="font-semibold hover:underline">
              {message.author.display_name}
            </p>
          </ProfilePopover>
          <p className="text-sm text-muted-foreground">
            {message.created_at &&
              new Date(message.created_at).toLocaleString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
          </p>
          <div className="ml-auto flex flex-row items-center gap-2">
            <Popover
              open={reactionsPopoverOpen}
              onOpenChange={(isOpen) => setReactionsPopoverOpen(isOpen)}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "bg-accent border-sidebar hover:bg-background",
                    isHovering ? "visible" : "invisible"
                  )}
                >
                  <SmilePlus />
                </Button>
              </PopoverTrigger>
              <EmojiPopoverContent
                onSelect={(emoji) => {
                  if (!userReactions.has(emoji)) {
                    onReactionAdd(emoji);
                    setReactionsPopoverOpen(false);
                  }
                }}
              />
            </Popover>
          </div>
        </div>
        {message.attachment_url && (
          <Image
            className="rounded-lg my-1"
            src={message.attachment_url}
            alt={message.content}
            width={300}
            height={300}
          />
        )}
        <p>{message.content}</p>
        <div className="flex flex-row gap-2 flex-wrap">
          {[...userReactions, ...otherReactions].map((reaction) => (
            <HoverCard key={reaction}>
              <HoverCardTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    userReactions.has(reaction)
                      ? "bg-sidebar! hover:bg-sidebar! hover:border-sidebar-foreground!"
                      : "hover:border-sidebar-foreground!"
                  )}
                  onClick={() => {
                    if (userReactions.has(reaction)) {
                      onReactionRemove(reaction);
                    } else {
                      onReactionAdd(reaction);
                    }
                  }}
                >
                  <p>{reaction}</p>
                  <p> {groupedReactions[reaction]?.length || "0"}</p>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-48">
                <ScrollArea>
                  <div className="flex flex-col gap-3">
                    {groupedReactions[reaction].map((r) => {
                      const profile = channelMembers.find(
                        (m) => m.id === r.profile_id
                      );
                      return (
                        <div
                          key={r.id}
                          className="flex flex-row items-center gap-2"
                        >
                          <ProfileAvatar profile={profile} />
                          <p>{profile?.display_name}</p>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>
    </div>
  );
}
