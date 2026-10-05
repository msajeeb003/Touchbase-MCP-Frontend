import { useEffect, useMemo, useState } from "react";
import { Search, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetLeadsQuery } from "@/store/features/leads/leadsApi";
import type { LeadItem } from "@/types/leads";

interface LeadSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLeadId: string | null;
  onSelectLead: (lead: LeadItem) => void;
}

const PAGE_LIMIT = 50;
const SEARCH_DEBOUNCE_MS = 300;

export function getInitials(name?: string) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export default function LeadSelectorDialog({
  open,
  onOpenChange,
  selectedLeadId,
  onSelectLead,
}: LeadSelectorDialogProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
  }, [open]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_LIMIT,
      search: debouncedSearch || undefined,
    }),
    [page, debouncedSearch],
  );

  const { data: leadsResponse, isLoading, isFetching, isError } = useGetLeadsQuery(
    queryParams,
    { skip: !open },
  );

  const leads = leadsResponse?.data?.items ?? [];
  const pagination = leadsResponse?.data?.pagination;
  const total = pagination?.total ?? 0;
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);
  const currentPage = pagination?.page ?? page;
  const startItem = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const endItem = Math.min(currentPage * PAGE_LIMIT, total);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-base font-semibold text-landing-fog">
            Pick from Leads
          </DialogTitle>
        </DialogHeader>

        <div className="border-b p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-fog/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="h-10 rounded-lg border-landing-sky/40 pl-9 text-sm placeholder:text-landing-fog/40 focus-visible:ring-landing-sky"
            />
          </div>
        </div>

        <div className="flex max-h-[350px] min-h-[100px] flex-col overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-landing-fog/55">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading leads...
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center p-8 text-sm text-landing-voice">
              Failed to load leads.
            </div>
          ) : leads.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-sm text-landing-fog/55">
              {debouncedSearch ? "No leads match your search." : "No leads found."}
            </div>
          ) : (
            leads.map((lead) => {
              const isSelected = lead.id === selectedLeadId;
              const initials = getInitials(lead.name);

              return (
                <div
                  key={lead.id}
                  onClick={() => {
                    onSelectLead(lead);
                    onOpenChange(false);
                  }}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors ${
                    isSelected
                      ? "border border-landing-sky/40 bg-landing-sky-soft"
                      : "border border-transparent hover:bg-landing-fog/[0.04]"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-landing-sky text-sm font-semibold text-landing-steel">
                    {initials}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold text-landing-fog">
                      {lead.name}
                    </span>
                    <span className="truncate text-[13px] text-landing-fog/55">
                      {lead.email}
                      {lead.phone ? ` · ${lead.phone}` : ""}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="ml-2 h-5 w-5 shrink-0 text-landing-sky" />
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t px-4 py-3">
          <p className="text-xs text-landing-fog/55">
            {total === 0
              ? "0 leads"
              : `Showing ${startItem}-${endItem} of ${total}`}
            {isFetching && !isLoading ? " · Updating..." : ""}
          </p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={!canGoPrev || isFetching}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[4.5rem] text-center text-xs font-medium text-landing-fog/65">
              {currentPage} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={!canGoNext || isFetching}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
