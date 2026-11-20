"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    UtensilsCrossed,
    PlusCircle,
    ClipboardList,
    CreditCard,
    Settings,
    ShoppingBag,
    Users,
    ArrowLeftRight,
} from "lucide-react"
import { authClient } from "@/lib/auth-client"

const menuItemsByRole = {
    vendor: [
        
        { id: "vendor-overview1", name: "Overview", url: "/dashboard/vendor", icon: LayoutDashboard },
        { id: "vendor-overview", name: "Overview", url: "/dashboard/vendor", icon: LayoutDashboard },
        { id: "vendor-add-menu-item", name: "Add Menu Item", url: "/dashboard/vendor/addItem", icon: PlusCircle },
        { id: "vendor-menu-items", name: "My Menu Items", url: "/dashboard/vendor/menuItem", icon: UtensilsCrossed },
        { id: "vendor-customer-orders", name: "Customer Orders", url: "/dashboard/vendor/orders", icon: ClipboardList },
        { id: "vendor-subscription", name: "Subscription", url: "/dashboard/vendor/subscription", icon: CreditCard },
        { id: "vendor-profile", name: "Profile Settings", url: "/dashboard/vendor/profile", icon: Settings },
    ],
    customer: [
        { id: "customer-overview1", name: "Overview", url: "/dashboard/customer", icon: LayoutDashboard },
        { id: "customer-overview", name: "Overview", url: "/dashboard/customer", icon: LayoutDashboard },
        { id: "customer-orders", name: "My Orders", url: "/dashboard/customer/orders", icon: ShoppingBag },
        { id: "customer-profile", name: "Profile Settings", url: "/dashboard/customer/profile", icon: Settings },
    ],
    admin: [
        { id: "admin-overview", name: "Overview", url: "/dashboard/admin", icon: LayoutDashboard },
        { id: "admin-users", name: "Manage Users", url: "/dashboard/admin/manageUsers", icon: Users },
        { id: "admin-menu-items", name: "Manage Menu Items", url: "/dashboard/admin/manageMenu", icon: UtensilsCrossed },
        { id: "admin-transactions", name: "Transactions", url: "/dashboard/admin/transactions", icon: ArrowLeftRight },
    ],
}

export function DashbordSiderbar() {
    const { data: session, isPending } = authClient.useSession()
    const pathname = usePathname()

    const role = session?.user?.role || "customer"
    const items = menuItemsByRole[role] || menuItemsByRole.customer

    return (
        <Sidebar>
            <SidebarHeader />
            <SidebarContent>
                <SidebarGroup />
                <SidebarGroup />
                <SidebarGroup>
                    {!isPending && (
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        isActive={pathname === item.url}
                                        render={<Link href={item.url} />}
                                    >
                                        <item.icon />
                                        <span>{item.name}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    )}
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}
