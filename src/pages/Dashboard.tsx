import {
  FileText,
  Layers3,
  LogOut,
  Shapes,
  Users2,
  BookOpen,
  History,
  Home,
  Inbox,
  Settings,
  Sparkles,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import BrandMark from "@/components/landing/BrandMark";
import { useLandingFontLink } from "@/components/landing/landingFonts";
import ThemeToggle from "@/components/dashboard/ThemeToggle";
import { useScopedAppTheme } from "@/lib/appTheme";
import { useGetMcpTokensQuery, useGetRunsQuery } from "@/store/features/harness/harnessApi";

const navItems = [
  { title: "Dashboard", to: "/dashboard", icon: Home },
  { title: "Leads", to: "/dashboard/leads", icon: Users2 },
  // AI harness: what Claude prepared, and what waits for a person.
  { title: "AI Tasks", to: "/dashboard/ai-tasks", icon: Sparkles },
  { title: "Review Queue", to: "/dashboard/review", icon: Inbox },
  { title: "Activity Log", to: "/dashboard/activity", icon: History },
  { title: "Sequences", to: "/dashboard/sequences", icon: Layers3 },
  { title: "Transcripts", to: "/dashboard/transcripts", icon: FileText },
  { title: "Templates", to: "/dashboard/templates", icon: Shapes },
  { title: "Settings", to: "/dashboard/settings", icon: Settings },
  { title: "How to configure", to: "/dashboard/how-to-configure", icon: BookOpen },
];

const breadcrumbLabelMap: Record<string, string> = {
  dashboard: "Dashboard",
  docs: "Docs",
  "ai-credentials": "AI credentials",
  "fathom-transcripts": "Fathom transcripts",
  "retell-ai-calling": "Retell AI calling",
  "email-smtp": "Email (SMTP)",
  "sms-settings": "SMS settings",
  leads: "Leads",
  sequences: "Sequences",
  transcripts: "Transcripts",
  templates: "Templates",
  settings: "Settings",
  "how-to-configure": "How to configure",
  "ai-tasks": "AI Tasks",
  review: "Review Queue",
  activity: "Activity Log",
  steps: "Steps",
  view: "View Steps",
};

export default function Dashboard() {
  useLandingFontLink();
  const [theme, setTheme] = useScopedAppTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(useCurrentUser);
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbItems = pathSegments.reduce<Array<{ href: string; label: string }>>(
    (items, segment, index) => {
      const isUuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        segment,
      );

      if (isUuidLike) {
        return items;
      }

      const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
      const parentSegment = pathSegments[index - 1];
      let label =
        breadcrumbLabelMap[segment] ??
        segment
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");

      if (segment === "new") {
        label = parentSegment === "templates" ? "New Template" : "New Sequence";
      } else if (segment === "edit") {
        label = parentSegment === "templates" || pathSegments.includes("templates")
          ? "Edit Template"
          : "Edit";
      }

      items.push({ href, label });
      return items;
    },
    [],
  );
  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  // AI harness: waiting drafts (badge), a running task (live dot), and whether Claude has a token.
  const { data: waitingRuns } = useGetRunsQuery({ status: "awaiting_approval", limit: 50 }, { pollingInterval: 30000 });
  const { data: liveRuns } = useGetRunsQuery({ status: "in_progress", limit: 1 }, { pollingInterval: 15000 });
  const { data: tokenData } = useGetMcpTokensQuery();
  const waitingCount = (waitingRuns?.data.items ?? []).reduce((n, r) => n + (r.counts?.awaiting_approval ?? 0), 0);
  const claudeWorking = (liveRuns?.data.items ?? []).length > 0;
  const activeTokens = (tokenData?.data ?? []).filter(
    (t) => !t.revokedAt && (!t.expiresAt || new Date(t.expiresAt).getTime() > Date.now()),
  );
  const lastUsed = activeTokens.map((t) => t.lastUsedAt).filter(Boolean).sort().pop();

  return (
    <SidebarProvider>
      {/* Steel chrome shared by every dashboard page. Page content keeps its own surface. */}
      <Sidebar collapsible="offcanvas" className="border-r border-landing-line">
        <SidebarHeader className="border-b border-landing-line bg-landing-steel-2 px-4 py-3 font-landing-sans">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 text-landing-fog no-underline"
          >
            <BrandMark className="h-8 w-8" />
            <span className="font-landing-display text-[15px] font-bold tracking-[-0.01em]">
              Touchbase AI
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="bg-landing-steel-2 px-2 py-3 font-landing-sans">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="text-landing-fog/60 hover:bg-landing-fog/5 hover:text-landing-fog active:bg-landing-fog/5 active:text-landing-fog data-[active=true]:bg-landing-sky-soft data-[active=true]:font-semibold data-[active=true]:text-landing-sky"
                  isActive={
                    location.pathname === item.to ||
                    (item.to !== "/dashboard" && location.pathname.startsWith(`${item.to}/`) &&
                      ["/dashboard/ai-tasks", "/dashboard/review"].includes(item.to))
                  }
                >
                  <NavLink to={item.to} end={item.to === "/dashboard"}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.to === "/dashboard/review" && waitingCount > 0 ? (
                      <span className="ml-auto rounded-full bg-landing-sms px-1.5 py-px font-landing-mono text-[10.5px] font-bold text-landing-steel">
                        {waitingCount}
                      </span>
                    ) : null}
                    {item.to === "/dashboard/ai-tasks" && claudeWorking ? (
                      <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-landing-violet" title="Claude is working" />
                    ) : null}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-landing-line bg-landing-steel-2 p-3 font-landing-sans">
          <Link
            to="/dashboard/settings#claude-access"
            className="mb-2 flex items-center gap-2 rounded-md border border-landing-line bg-landing-steel p-2 no-underline hover:bg-landing-fog/[0.04]"
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${activeTokens.length ? "bg-landing-whatsapp" : "bg-landing-fog/30"} ${claudeWorking ? "animate-pulse" : ""}`}
            />
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-landing-fog/85">
                {activeTokens.length ? "Claude connected" : "Claude not connected"}
              </p>
              <p className="truncate text-[11px] text-landing-fog/45">
                {!activeTokens.length
                  ? "Create an access token"
                  : claudeWorking
                    ? "Working on a task now"
                    : lastUsed
                      ? `Last used ${new Date(lastUsed).toLocaleString()}`
                      : "Token ready, not used yet"}
              </p>
            </div>
          </Link>
          <div className="mb-2 flex items-center gap-2 rounded-md border border-landing-line bg-landing-steel p-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-landing-sky-soft text-xs font-semibold text-landing-sky">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-landing-mono text-[10px] uppercase tracking-[0.12em] text-landing-fog/45">
                Signed in as
              </p>
              <p className="truncate text-[12px] text-landing-fog/80" title={user?.email}>
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-landing-voice/40 bg-transparent text-landing-voice hover:bg-landing-voice/10 hover:text-landing-voice"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="flex h-14 items-center gap-2 border-b border-landing-line bg-landing-steel-2 px-4 font-landing-sans">
          <SidebarTrigger className="text-landing-fog/70 hover:bg-landing-fog/5 hover:text-landing-fog" />
          <Separator orientation="vertical" className="h-4 bg-landing-line" />
          <Breadcrumb>
            <BreadcrumbList className="text-landing-fog/50">
              {breadcrumbItems.map((item, index) => (
                <div key={item.href} className="inline-flex items-center gap-1.5">
                  <BreadcrumbItem>
                    {index === breadcrumbItems.length - 1 ? (
                      <BreadcrumbPage className="text-landing-fog">{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild className="hover:text-landing-fog">
                        <Link to={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbItems.length - 1 ? <BreadcrumbSeparator /> : null}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <ThemeToggle theme={theme} onChange={setTheme} className="ml-auto shrink-0" />
        </header>
        <main className="min-w-0 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
