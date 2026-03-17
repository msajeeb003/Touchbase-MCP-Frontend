import {
  FileText,
  LayoutDashboard,
  Layers3,
  LogOut,
  Shapes,
  Users2,
  Bot,
  Home,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { logout } from "@/store/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useCurrentUser } from "@/store/features/auth/authSlice";

const navItems = [
  { title: "Dashboard", to: "/dashboard", icon: Home },
  { title: "Leads", to: "/dashboard/leads", icon: Users2 },
  { title: "Sequences", to: "/dashboard/sequences", icon: Layers3 },
  { title: "Transcripts", to: "/dashboard/transcripts", icon: FileText },
  { title: "Templates", to: "/dashboard/templates", icon: Shapes },
];

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(useCurrentUser);
  const activeItem = navItems.find((item) => item.to === location.pathname);
  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" className="border-r bg-white">
        <SidebarHeader className="border-b bg-slate-50/70 px-4 py-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <Bot className="h-4 w-4" />
            <p className="text-sm font-semibold">Follow-Up Agent</p>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 py-3">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 data-[active=true]:bg-indigo-100 data-[active=true]:text-indigo-700"
                  isActive={location.pathname === item.to}
                >
                  <NavLink to={item.to}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t p-3">
          <div className="mb-2 flex items-center gap-2 rounded-md bg-slate-50 p-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-100 text-xs font-semibold text-indigo-700">
                U
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-medium text-slate-900">Email</p>
              <p className="text-[11px] text-slate-500">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-red-300 text-red-700 hover:bg-red-100"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-sm font-medium text-slate-700">
            {activeItem?.title || "Dashboard"}
          </h1>
        </header>
        <main className="p-6">
          <h1 className="mb-4 text-2xl font-semibold text-slate-900">
            {activeItem?.title || "Dashboard"}
          </h1>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
