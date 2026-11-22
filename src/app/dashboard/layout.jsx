import { Suspense } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import NavberPage from "@/components/Navber";
import { DashbordSiderbar } from "../components/DashbordSiderbar";

const DashbordLayout = ({ children }) => {
    return (
    <SidebarProvider>
      <Suspense fallback={<div className="hidden" />}>
        <DashbordSiderbar />
      </Suspense>
      {/* Everything right of the sidebar lives in this column, so the navbar
          spans the remaining width only and never covers the sidebar.
          It also follows the sidebar automatically when it collapses. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <NavberPage hideOnDashboard={false} />
        <main className="flex min-w-0 flex-1 flex-col">
          <SidebarTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>

    );
};

export default DashbordLayout;
