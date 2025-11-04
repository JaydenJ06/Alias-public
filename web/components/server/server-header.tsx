/**
 * Header to show on each server page.
 *
 * @author Ajay Gandecha <ajay@class.unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import {
  ChevronDown,
  Copy,
  DoorClosed,
  Edit,
  Hash,
  ImageUp,
  Plus,
  Search,
  Trash,
  UsersRound,
} from "lucide-react";
import { Input } from "../ui/input";
import { z } from "zod";
import { Server } from "@/utils/supabase/models/server";
import { Channel } from "@/utils/supabase/models/channel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { useQueryClient } from "@tanstack/react-query";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  changeServerImage,
  deleteServer,
  leaveServer,
  renameServer,
} from "@/utils/supabase/queries/server";
import { createChannel } from "@/utils/supabase/queries/channel";
import { useRouter } from "next/router";
import { User } from "@supabase/supabase-js";
import { broadcastUserChange } from "@/utils/supabase/realtime/broadcasts";

type ServerHeaderProps = {
  user: User;
  selectedServer?: z.infer<typeof Server>;
  selectedChannel?: z.infer<typeof Channel>;
  filterQuery: string;
  setFilterQuery: (query: string) => void;
};
export default function ServerHeader({
  user,
  selectedServer,
  selectedChannel,
  filterQuery,
  setFilterQuery,
}: ServerHeaderProps) {
  const supabase = createSupabaseComponentClient();
  const queryUtils = useQueryClient();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameText, setRenameText] = useState(selectedServer?.name ?? "");
  const [newChannelDialogOpen, setNewChannelDialogOpen] = useState(false);
  const [newChannelText, setNewChannelText] = useState("");
  const [leaveAlertOpen, setLeaveAlertOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

  // Create states to handle selecting and uploading files.

  // The input ref points to the hidden HTML file input element that
  // can be "clicked" to open the file picker.
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isServerAdmin = selectedServer?.server_creator_id === user.id;
  return (
    <header className="bg-sidebar flex flex-row shrink-0 items-center gap-2 border-b z-50 h-14">
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={(isOpen) => setDropdownOpen(isOpen)}
      >
        <DropdownMenuTrigger
          className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          asChild
        >
          <div className="flex flex-row w-[240px] items-center justify-between h-full border-r p-3">
            <div className="flex flex-row items-center h-full gap-2">
              <UsersRound className="size-5 text-muted-foreground" />
              <p className="font-bold">{selectedServer?.name ?? ""}</p>
            </div>
            <ChevronDown className="size-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          {/* Rename Dialog */}
          {isServerAdmin && (
            <Dialog
              open={renameDialogOpen}
              onOpenChange={(isOpen) => setRenameDialogOpen(isOpen)}
            >
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    setRenameDialogOpen(true);
                  }}
                >
                  <Edit />
                  Rename
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename Server</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name" className="text-right">
                      Server Name
                    </Label>
                    <Input
                      id="name"
                      value={renameText}
                      onChange={(e) => setRenameText(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    disabled={renameText.length < 1}
                    type="submit"
                    onClick={async () => {
                      if (selectedServer) {
                        await renameServer(supabase, {
                          ...selectedServer,
                          name: renameText,
                        });
                        toast("Server renamed.");
                        queryUtils.refetchQueries({ queryKey: ["servers"] });
                        queryUtils.refetchQueries({ queryKey: ["server"] });
                        setRenameDialogOpen(false);
                        setDropdownOpen(false);
                      }
                    }}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Change Server Image */}
          {isServerAdmin && (
            <DropdownMenuItem
              onClick={() => {
                if (fileInputRef && fileInputRef.current)
                  fileInputRef.current.click();
              }}
            >
              <ImageUp />
              Change Server Image
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          {/* Copy Join Code */}
          <DropdownMenuItem
            onClick={async () => {
              await navigator.clipboard.writeText(selectedServer?.id ?? "");
              toast("Join code copied to clipboard.");
            }}
          >
            <Copy />
            Copy Join Code
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* New Channel Dialog */}
          <Dialog
            open={newChannelDialogOpen}
            onOpenChange={(isOpen) => setNewChannelDialogOpen(isOpen)}
          >
            <DialogTrigger asChild>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  setNewChannelDialogOpen(true);
                }}
              >
                <Plus />
                New Channel
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Channel</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3 py-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-right">
                    Channel Name
                  </Label>
                  <Input
                    id="name"
                    value={newChannelText}
                    onChange={(e) => setNewChannelText(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={newChannelText.length < 1}
                  type="submit"
                  onClick={async () => {
                    if (selectedServer) {
                      await createChannel(
                        supabase,
                        selectedServer.id,
                        newChannelText
                      );
                      toast("Channel created.");
                      queryUtils.refetchQueries({ queryKey: ["channels"] });
                      setNewChannelDialogOpen(false);
                      setDropdownOpen(false);
                    }
                  }}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <DropdownMenuSeparator />
          {/* Leave Dialog */}
          <AlertDialog
            open={leaveAlertOpen}
            onOpenChange={(isOpen) => setLeaveAlertOpen(isOpen)}
          >
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  setLeaveAlertOpen(true);
                }}
                variant="destructive"
              >
                <DoorClosed />
                Leave Server
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={async () => {
                    setLeaveAlertOpen(false);
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (selectedServer) {
                      await leaveServer(supabase, selectedServer.id);
                      broadcastUserChange(supabase);
                      toast("Left server.");
                      queryUtils.refetchQueries({ queryKey: ["servers"] });
                      setLeaveAlertOpen(false);
                      setDropdownOpen(false);
                      router.push("/");
                    }
                  }}
                >
                  Leave
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {/* Delete Dialog */}
          {isServerAdmin && (
            <AlertDialog
              open={deleteAlertOpen}
              onOpenChange={(isOpen) => setDeleteAlertOpen(isOpen)}
            >
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    setDeleteAlertOpen(true);
                  }}
                  variant="destructive"
                >
                  <Trash />
                  Delete Server
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Deleted servers are not recoverable.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={async () => {
                      setDeleteAlertOpen(false);
                    }}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      if (selectedServer) {
                        await deleteServer(supabase, selectedServer.id);
                        toast("Server deleted.");
                        queryUtils.refetchQueries({ queryKey: ["servers"] });
                        setDeleteAlertOpen(false);
                        setDropdownOpen(false);
                        await router.push("/");
                      }
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* 
        This hidden input provides us the functionality to handle selecting
        new images. This input only accepts images, and when a file is selected,
        the file is stored in the `selectedFile` state.
        */}
      <Input
        className="hidden"
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={async (e) => {
          const file =
            (e.target.files ?? []).length > 0 ? e.target.files![0] : null;
          if (file) {
            await changeServerImage(supabase, selectedServer?.id ?? "", file);

            toast("Server image changed.", {
              description:
                "It may take a few minutes for the image to process.",
            });
            queryUtils.refetchQueries({ queryKey: ["servers"] });
          }
        }}
      />
      <div className="flex flex-row grow items-center justify-between h-full border-r p-3">
        <div className="flex flex-row items-center h-full gap-2">
          <Hash className="size-5 text-muted-foreground" />
          <p className="font-bold pt-1">{selectedChannel?.name ?? ""}</p>
        </div>
        <div className="flex flex-row items-center h-full gap-2">
          <div className="relative grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search channel..."
              className="h-9 pl-8 bg-background"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
