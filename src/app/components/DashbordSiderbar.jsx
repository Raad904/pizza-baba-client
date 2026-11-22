"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
    LayoutDashboard,
    UtensilsCrossed,
    PlusCircle,
    ClipboardList,
    CreditCard,
    ShoppingBag,
    Users,
    ArrowLeftRight,
    LogOut,
    User,
} from "lucide-react"
import { cn } from "cn"
import { authClient } from "@/lib/auth-client"

const menuItemsByRole = {
    vendor: [
        { id: "vendor-overview", name: "Overview", url: "/dashboard/vendor", icon: LayoutDashboard },
        { id: "vendor-add-menu-item", name: "Add Menu Item", url: "/dashboard/vendor/addItem", icon: PlusCircle },
        { id: "vendor-menu-items", name: "My Menu Items", url: "/dashboard/vendor/menuItem", icon: UtensilsCrossed },
        { id: "vendor-customer-orders", name: "Customer Orders", url: "/dashboard/vendor/orders", icon: ClipboardList },
        { id: "vendor-subscription", name: "Subscription", url: "/dashboard/vendor/subscription", icon: CreditCard },
    ],
    customer: [
        { id: "customer-overview", name: "Overview", url: "/dashboard/customer", icon: LayoutDashboard },
        { id: "customer-orders", name: "My Orders", url: "/dashboard/customer/orders", icon: ShoppingBag },
    ],
    admin: [
        { id: "admin-overview", name: "Overview", url: "/dashboard/admin", icon: LayoutDashboard },
        { id: "admin-users", name: "Manage Users", url: "/dashboard/admin/manageUsers", icon: Users },
        { id: "admin-menu-items", name: "Manage Menu Items", url: "/dashboard/admin/manageMenu", icon: UtensilsCrossed },
        { id: "admin-transactions", name: "Transactions", url: "/dashboard/admin/transactions", icon: ArrowLeftRight },
    ],
}

const initialsOf = (name) =>
    name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()

// Shared pill styles so menu items and the sign-out button look identical
const pillBase =
    "h-11 gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors"

export function DashbordSiderbar() {
    const { data: session, isPending } = authClient.useSession()
    const pathname = usePathname()
    const router = useRouter()

    const role = session?.user?.role || "customer"
    const items = menuItemsByRole[role] || menuItemsByRole.customer
    const user = session?.user
    const displayName = user?.name || "My Account"
    const avatar = user?.image

    const handleSignOut = async () => {
        try {
            await authClient.signOut()
        } finally {
            router.push("/")
            router.refresh()
        }
    }

    return (
        <Sidebar
            variant="floating"
            className="p-3 [&>[data-slot=sidebar-inner][data-sidebar=sidebar]]:rounded-2xl"
        >
            {/* Dark navy panel — covers both the desktop sidebar and the mobile sheet */}
            <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-[#1b2851] text-white">
                {/* ===== Profile ===== */}
                <SidebarHeader className="gap-2 px-4 pb-4 pt-5">
                    <div className="flex items-center gap-3">
                        {avatar ? (
                            <Image
                                src={avatar}
                                alt={displayName}
                                width={44}
                                height={44}
                                unoptimized={!avatar.startsWith("/")}
                                className="size-11 shrink-0 rounded-full object-cover ring-2 ring-white/15"
                            />
                        ) : (
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-bold text-white ring-2 ring-white/15">
                                {user?.name ? (
                                    initialsOf(user.name)
                                ) : (
                                    <User className="size-5" />
                                )}
                            </span>
                        )}
                        <div className="min-w-0">
                            <p className="truncate text-[17px] font-semibold leading-tight text-white">
                                {displayName}
                            </p>
                            <p className="mt-0.5 truncate text-xs font-medium capitalize text-slate-400">
                                {role}
                            </p>
                        </div>
                    </div>
                </SidebarHeader>

                {/* ===== Navigation ===== */}
                <SidebarContent className="px-3 pb-2">
                    {!isPending && (
                        <SidebarMenu className="gap-2">
                            {items.map((item) => {
                                const active = pathname === item.url
                                return (
                                    <SidebarMenuItem key={item.id}>
                                        <SidebarMenuButton
                                            isActive={active}
                                            render={<Link href={item.url} />}
                                            className={cn(
                                                pillBase,
                                                active
                                                    ? "bg-[#0e1738] font-semibold text-white hover:bg-[#0e1738] hover:text-white active:bg-[#0e1738] data-active:bg-[#0e1738] data-active:font-semibold data-active:text-white"
                                                    : "text-slate-300 hover:bg-white/5 hover:text-white active:bg-white/10 active:text-white"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                                                    active
                                                        ? "border-white/15 bg-white/10 text-white"
                                                        : "border-transparent text-slate-400"
                                                )}
                                            >
                                                <item.icon className="size-4" />
                                            </span>
                                            <span className="truncate">
                                                {item.name}
                                            </span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    )}
                </SidebarContent>

                {/* ===== Footer ===== */}
                <SidebarFooter className="border-t border-white/10 px-3 pb-4 pt-3">
                    <SidebarMenuButton
                        onClick={handleSignOut}
                        className={cn(
                            pillBase,
                            "w-full text-slate-300 hover:bg-white/5 hover:text-white active:bg-white/10 active:text-white"
                        )}
                    >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-slate-400">
                            <LogOut className="size-4" />
                        </span>
                        <span>Sign Out</span>
                    </SidebarMenuButton>
                </SidebarFooter>
            </div>
        </Sidebar>
    )
}
