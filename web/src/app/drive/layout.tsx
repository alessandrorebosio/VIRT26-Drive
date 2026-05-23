"use client"

import { useCallback } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, LogOut } from "lucide-react";
import { baseUrl, items } from "./sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function DriveLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const handleSignOut = useCallback(async () => {
        const supabase = createClient()
        const { error } = await supabase.auth.signOut()
        if (error) {
            return toast.error(error.message)
        }
        toast.success("Successfully signed out")
    }, [])

    const renderMenuItems = useCallback((itemsArray: typeof items.content) =>
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
                            {renderMenuItems(items.content)}
                        </SidebarMenu>
                    </SidebarGroup>

                </SidebarContent>

                <SidebarFooter>
                    <SidebarMenu>
                        {renderMenuItems(items.footer)}
                        <SidebarMenuItem className="py-0.5">
                            <SidebarMenuButton onClick={handleSignOut}>
                                <LogOut />
                                <span>SignOut</span>
                            </SidebarMenuButton>
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
