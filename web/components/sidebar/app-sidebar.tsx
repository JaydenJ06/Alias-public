/**
 * Sidebar for the entire app showing all servers that the user is in.
 *
 * @author Ajay Gandecha <ajay@cs.unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 * @see https://ui.shadcn.com/docs/components/sidebar
 */

import { BotMessageSquare, DoorOpen, Plus } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createServer,
  getServers,
  joinServer,
} from "@/utils/supabase/queries/server";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { Avatar } from "../ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { DialogDescription } from "@radix-ui/react-dialog";
import { broadcastUserChange } from "@/utils/supabase/realtime/broadcasts";

type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

export function AppSidebar({ ...props }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createSupabaseComponentClient();
  const queryUtils = useQueryClient();

  const { data: servers } = useQuery({
    queryKey: ["servers"],
    queryFn: async () => {
      return await getServers(supabase);
    },
  });

  const selectedServerId =
    pathname.split("/").length > 1 ? pathname.split("/")[1] : "";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [joinServerDialogOpen, setJoinServerDialogOpen] = useState(false);
  const [joinServerText, setJoinServerText] = useState("");
  const [newServerDialogOpen, setNewServerDialogOpen] = useState(false);
  const [newServerText, setNewServerText] = useState("");

  return (
    <Sidebar
      collapsible="none"
      className="h-screen overflow-hidden *:data-[sidebar=sidebar]:flex-col w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      {...props}
    >
      <ScrollArea className="h-[calc(100vh)]">
        <SidebarHeader className="flex flex-row justify-center items-center w-full h-[55px]">
          <BotMessageSquare className="size-8" />
        </SidebarHeader>
        <Separator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 py-2 md:px-0">
              <SidebarMenu>
                {servers &&
                  servers.map((server) => (
                    <SidebarMenuItem
                      key={server.id}
                      onClick={() =>
                        router.push(`/${server.id}/${server.channels[0].id}`)
                      }
                    >
                      {selectedServerId === server.id && (
                        <div className="absolute left-[-8px] h-8 mt-2 w-[3px] rounded bg-foreground"></div>
                      )}
                      <SidebarMenuButton
                        size="lg"
                        asChild
                        className="md:h-12 md:p-0 bg-sidebar-accent"
                      >
                        <Avatar className="size-12 rounded-full hover:rounded-xl hover:cursor-pointer">
                          <AvatarImage
                            src={server.server_image_url ?? ""}
                            alt={server.name}
                          />
                          <AvatarFallback className="flex flex-row justify-center w-full">
                            <p className="w-full text-center">
                              {server.name.slice(0, 2).toUpperCase()}
                            </p>
                          </AvatarFallback>
                        </Avatar>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                <SidebarMenuItem>
                  <DropdownMenu
                    open={dropdownOpen}
                    onOpenChange={(isOpen) => setDropdownOpen(isOpen)}
                  >
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        size="lg"
                        asChild
                        className="md:h-12 md:p-0"
                        onClick={() => setNewServerDialogOpen(true)}
                      >
                        <a href="#">
                          <div className="bg-sidebar-accent flex aspect-square size-12 items-center justify-center rounded-full">
                            <Plus className="size-6 text-foreground" />
                          </div>
                        </a>
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                      side="right"
                      align="start"
                      sideOffset={4}
                    >
                      {/* Join Server Dialog */}
                      <Dialog
                        open={joinServerDialogOpen}
                        onOpenChange={(isOpen) =>
                          setJoinServerDialogOpen(isOpen)
                        }
                      >
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              setJoinServerDialogOpen(true);
                            }}
                          >
                            <DoorOpen />
                            Join Server
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Join Server</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                              Paste in the ID of the server that you want to
                              join below. Ask a friend for this code if you do
                              not have it!
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col gap-3 py-3">
                            <div className="flex flex-col items-center w-full gap-2">
                              <Input
                                id="name"
                                placeholder="Server ID here..."
                                value={joinServerText}
                                onChange={(e) =>
                                  setJoinServerText(e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              disabled={joinServerText.length < 1}
                              type="submit"
                              onClick={() => {
                                joinServer(supabase, joinServerText)
                                  .then((server) => {
                                    broadcastUserChange(supabase);
                                    toast("Server joined.");
                                    queryUtils.refetchQueries({
                                      queryKey: ["servers"],
                                    });
                                    setJoinServerDialogOpen(false);
                                    setDropdownOpen(false);
                                    router.push(
                                      `/${server.id}/${server.channels[0].id}`
                                    );
                                  })
                                  .catch(() => {
                                    toast(
                                      "Error: Invalid server code. Please try again."
                                    );
                                  });
                              }}
                            >
                              Join
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <DropdownMenuSeparator />
                      {/* Create Server Dialog */}
                      <Dialog
                        open={newServerDialogOpen}
                        onOpenChange={(isOpen) =>
                          setNewServerDialogOpen(isOpen)
                        }
                      >
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              setNewServerDialogOpen(true);
                            }}
                          >
                            <Plus />
                            Create Server
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>New Server</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col gap-3 py-3">
                            <div className="flex flex-col gap-2">
                              <Label htmlFor="name" className="text-right">
                                Server Name
                              </Label>
                              <Input
                                id="name"
                                value={newServerText}
                                onChange={(e) =>
                                  setNewServerText(e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              disabled={newServerText.length < 1}
                              type="submit"
                              onClick={async () => {
                                const server = await createServer(
                                  supabase,
                                  newServerText
                                );
                                toast("Server created.");
                                queryUtils.refetchQueries({
                                  queryKey: ["servers"],
                                });
                                setNewServerDialogOpen(false);
                                setDropdownOpen(false);
                                router.push(
                                  `/${server.id}/${server.channels[0].id}`
                                );
                              }}
                            >
                              Create
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </ScrollArea>
    </Sidebar>
  );
}
