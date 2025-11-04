/**
 * Component that shows emoji options. This should be used as the content for a
 * Shadcn <Popover> component.
 *
 * @author Ajay Gandecha <ajay@cs.unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import { PopoverContent } from "../ui/popover";
import { EMOJI_CATEGORIES, EMOJIS_BY_CATEGORY } from "@/utils/emoji/emoji-list";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

type EmojiPopoverContentProps = { onSelect: (emoji: string) => void };
export default function EmojiPopoverContent({
  onSelect,
}: EmojiPopoverContentProps) {
  return (
    <PopoverContent className="w-[248px] bg-sidebar">
      <ScrollArea className="h-[320px] w-[220px]">
        {EMOJI_CATEGORIES.map((category) => (
          <div key={category}>
            <p className="font-semibold text-sm py-2">{category}</p>
            <div className="flex flex-row py-2 flex-wrap gap-2 w-full">
              {EMOJIS_BY_CATEGORY[category].map((emoji, emojiIndex) => (
                <Button
                  key={`${category}-${emojiIndex}`}
                  variant="ghost"
                  size="icon"
                  onClick={() => onSelect(emoji)}
                >
                  <p className="text-lg">{emoji}</p>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </PopoverContent>
  );
}
