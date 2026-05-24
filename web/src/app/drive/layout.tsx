"use client"

import { useCallback } from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, LogOut, User as UserIcon, ChevronsUpDown } from "lucide-react"
import { accountUrl, baseUrl, items } from "./sidebar"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsMobile } from "@/hooks/use-mobile"

export default function DriveLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const isMobile = useIsMobile()

    const { user, profile, loading: profileLoading, displayName } = useUser()

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            return toast.error(error.message)
        }
        toast.success("Successfully signed out")
        router.push("/auth/sign-in")
    }

    const renderMenuItems = useCallback((itemsArray: typeof items.app) =>
        itemsArray.map((item) => (
            <SidebarMenuItem key={item.title} className="py-0.5">
                <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )), [pathname])

    const name = profile?.username || displayName

    return (
        <SidebarProvider>
            <Sidebar variant="floating" collapsible="icon">
                <SidebarHeader>
                    <Link href={baseUrl} className="flex items-center gap-2 py-1">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <LayoutDashboard className="size-4" />
                        </div>
                        <span className="truncate text-sm font-semibold leading-tight">
                            Drive
                        </span>
                    </Link>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Applications</SidebarGroupLabel>
                        <SidebarMenu>
                            {renderMenuItems(items.app)}
                        </SidebarMenu>
                    </SidebarGroup>

                    {profile?.role === "admin" && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Administration</SidebarGroupLabel>
                            <SidebarMenu>
                                {renderMenuItems(items.admin)}
                            </SidebarMenu>
                        </SidebarGroup>
                    )}
                </SidebarContent>

                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    >
                                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                            <UserIcon className="size-4" />
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            {profileLoading ? (
                                                <div className="space-y-1">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-3 w-32" />
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="truncate font-semibold">{name}</span>
                                                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                                                </>
                                            )}
                                        </div>
                                        <ChevronsUpDown className="ml-auto size-4" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                    side={isMobile ? "bottom" : "right"}
                                    align="end"
                                    sideOffset={4}
                                >
                                    <DropdownMenuLabel className="p-0 font-normal">
                                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                                <UserIcon className="size-4" />
                                            </div>
                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                <span className="truncate font-semibold">{name}</span>
                                                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem asChild>
                                            <Link href={accountUrl} className="w-full flex items-center gap-2">
                                                <UserIcon className="size-4" />
                                                Account
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                                        <LogOut className="size-4" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            <main className="flex flex-1 flex-col bg-[radial-gradient(circle_at_center,var(--muted)_0%,transparent_100%)]">
                <header className="flex h-16 shrink-0 items-center border-b">
                    <SidebarTrigger />
                </header>

                <div className="flex flex-1 flex-col">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}
