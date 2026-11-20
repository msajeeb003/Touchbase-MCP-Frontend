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
import { useSteelTheme } from "@/components/dashboard/dashboardTheme";
import { cn } from "@/lib/utils";
import { rel } from "@/lib/harness/labels";
import { useGetMcpTokensQuery, useGetRunsQuery } from "@/store/features/harness/harnessApi";

// Daily work first; set-up pages in a second group.
const navGroups = [
  {
    label: null,
    items: [
      { title: "Dashboard", to: "/dashboard", icon: Home },
      { title: "Leads", to: "/dashboard/leads", icon: Users2 },
      // AI harness: what Claude prepared, and what waits for a person.
      { title: "AI Tasks", to: "/dashboard/ai-tasks", icon: Sparkles },
      { title: "Review Queue", to: "/dashboard/review", icon: Inbox },
      { title: "Activity Log", to: "/dashboard/activity", icon: History },
    ],
  },
  {
    label: "Manage",
    items: [
      { title: "Sequences", to: "/dashboard/sequences", icon: Layers3 },
      { title: "Transcripts", to: "/dashboard/transcripts", icon: FileText },
      { title: "Templates", to: "/dashboard/templates", icon: Shapes },
      { title: "Settings", to: "/dashboard/settings", icon: Settings },
      { title: "How to configure", to: "/dashboard/how-to-configure", icon: BookOpen },
    ],
  },
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
  deleted: "Recently deleted",
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
  // Steel surface variables on <body> for every dashboard page and its dialogs.
  useSteelTheme();
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

  const isActive = (to: string) =>
    location.pathname === to ||
    (to !== "/dashboard" &&
      location.pathname.startsWith(`${to}/`) &&
      ["/dashboard/ai-tasks", "/dashboard/review"].includes(to));

  // Sidebar sections are transparent over the glass on desktop; the mobile sheet needs a solid fill.
  const sideSection = "bg-transparent font-landing-sans max-md:bg-[rgb(var(--tb-surface-strong))]";

  return (
    <SidebarProvider className="tb-canvas">
      <Sidebar
        collapsible="offcanvas"
        className="tb-glass border-y-0 border-l-0 shadow-none [&>[data-sidebar=sidebar]]:bg-transparent"
      >
        <SidebarHeader className={cn(sideSection, "px-4 pb-2 pt-4")}>
          <Link to="/dashboard" className="flex items-center gap-2.5 text-tb-ink no-underline">
            <BrandMark className="h-8 w-8" />
            <span className="font-landing-display text-[15px] font-bold tracking-[-0.01em]">Touchbase AI</span>
          </Link>
        </SidebarHeader>

        <SidebarContent className={cn(sideSection, "gap-5 px-3 py-3")}>
          {navGroups.map((group) => (
            <div key={group.label ?? "main"}>
              {group.label ? <p className="tb-label mb-1.5 px-2.5">{group.label}</p> : null}
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/dashboard"}
                      data-active={isActive(item.to)}
                      className="tb-nav-item"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                      {item.to === "/dashboard/review" && waitingCount > 0 ? (
                        <span className="ml-auto rounded-full bg-landing-sms px-1.5 py-px font-landing-mono text-[10.5px] font-bold text-[rgb(var(--tb-on-accent))]">
                          {waitingCount}
                        </span>
                      ) : null}
                      {item.to === "/dashboard/ai-tasks" && claudeWorking ? (
                        <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-landing-violet" title="Claude is working" />
                      ) : null}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          ))}
        </SidebarContent>

        <SidebarFooter className={cn(sideSection, "gap-2 p-3")}>
          <Link
            to="/dashboard/settings#claude-access"
            className="tb-well flex items-center gap-2.5 px-3 py-2 no-underline transition-colors hover:bg-tb-ink/[0.06]"
          >
            <span
              className={cn(
                "h-2 w-2 shrink-0 rounded-full",
                activeTokens.length ? "bg-landing-whatsapp" : "bg-tb-ink-3",
                claudeWorking && "animate-pulse",
              )}
            />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-tb-ink">
                {activeTokens.length ? "Claude connected" : "Connect Claude"}
              </p>
              <p className="truncate text-[11.5px] text-tb-ink-3">
                {!activeTokens.length
                  ? "No access token"
                  : claudeWorking
                    ? "Working now"
                    : lastUsed
                      ? `Used ${rel(lastUsed)}`
                      : "Not used yet"}
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2.5 px-1 py-1">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-tb-accent/15 text-xs font-semibold text-tb-accent">{userInitial}</AvatarFallback>
            </Avatar>
            <p className="min-w-0 flex-1 truncate text-[13px] text-tb-ink-2" title={user?.email}>
              {user?.email}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-tb-ink-3 transition-colors hover:bg-landing-voice/10 hover:text-landing-voice"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-transparent">
        <header className="tb-glass sticky top-0 z-20 flex h-14 items-center gap-2 border-x-0 border-t-0 px-4 font-landing-sans shadow-none">
          <SidebarTrigger className="text-tb-ink-3 hover:bg-tb-ink/5 hover:text-tb-ink" />
          <Separator orientation="vertical" className="h-4 bg-tb-ink/10" />
          <Breadcrumb>
            <BreadcrumbList className="text-tb-ink-3">
              {breadcrumbItems.map((item, index) => (
                <div key={item.href} className="inline-flex items-center gap-1.5">
                  <BreadcrumbItem>
                    {index === breadcrumbItems.length - 1 ? (
                      <BreadcrumbPage className="font-medium text-tb-ink">{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild className="hover:text-tb-ink">
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
