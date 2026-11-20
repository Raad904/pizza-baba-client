import { Suspense } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import { DashbordSiderbar } from "../components/DashbordSiderbar";

const DashbordLayout = ({ children }) => {
    return (
    <SidebarProvider>
      <Suspense fallback={<div className="hidden" />}>
        <DashbordSiderbar />
      </Suspense>
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  
    );
};

export default DashbordLayout;