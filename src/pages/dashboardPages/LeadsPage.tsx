import { useMemo, useState } from "react";
import { ArrowRight, Plus, Search, Upload, Users2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetLeadsQuery } from "@/store/features/leads/leadsApi";

const statusOptions = ["All", "Active", "Processing", "Replied", "Booked", "Won", "Lost"] as const;
const stageOptions = ["All", "NoShow", "After Sale", "PRD", "HotLead", "Cancel"] as const;

const getStatusBadgeClass = (status: string) => {
  const value = status.toLowerCase();
  if (value === "active") return "bg-green-100 text-green-700 border-green-200";
  if (value === "processing") return "bg-orange-100 text-orange-700 border-orange-200";
  if (value === "replied") return "bg-indigo-100 text-indigo-700 border-indigo-200";
  if (value === "booked") return "bg-violet-100 text-violet-700 border-violet-200";
  if (value === "won") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (value === "lost") return "bg-rose-100 text-rose-700 border-rose-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

const getStageBadgeClass = (stage: string) => {
  const value = stage.toLowerCase();
  if (value.includes("no")) return "bg-indigo-100 text-indigo-700 border-indigo-200";
  if (value.includes("after")) return "bg-purple-100 text-purple-700 border-purple-200";
  if (value.includes("prd")) return "bg-violet-100 text-violet-700 border-violet-200";
  if (value.includes("hot")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("All");
  const [stage, setStage] = useState<string>("All");

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      status: status === "All" ? undefined : status,
      search: search.trim() ? search.trim() : undefined,
      followUpStage: stage === "All" ? undefined : stage,
    }),
    [page, limit, status, search, stage],
  );

  const { data, isLoading, isError } = useGetLeadsQuery(queryParams);

  const total = data?.data.pagination.total ?? 0;
  const totalPages = data?.data.pagination.totalPages ?? 1;
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const leads = data?.data.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Follow Up Dashboard</p>
          <h2 className="flex items-center gap-2 text-3xl font-semibold text-slate-900">
            <Users2 className="h-7 w-7 text-indigo-600" />
            Leads
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-8">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search name, email, company..."
              className="pl-10"
            />
          </div>

          <div className="md:col-span-2">
            <Select
              value={status}
              onValueChange={(value) => {
                setPage(1);
                setStatus(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    Status: {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Select
              value={stage}
              onValueChange={(value) => {
                setPage(1);
                setStage(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Stage: All" />
              </SelectTrigger>
              <SelectContent>
                {stageOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    Stage: {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-md border border-dashed p-8 text-center text-slate-500">
            Loading leads...
          </div>
        ) : isError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-8 text-center text-red-600">
            Failed to fetch leads.
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-900">No leads found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Try changing filters or search keyword to find lead data.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>FollowUp Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell>{lead.location}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStageBadgeClass(lead.followUpStage)}>
                        {lead.followUpStage}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeClass(lead.status)}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-1 text-indigo-600 hover:text-indigo-700">
                        View
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t pt-3 text-sm text-slate-600 md:flex-row">
              <p>
                Showing {startItem}-{endItem} of {total}
              </p>

              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if (page > 1) setPage((prev) => prev - 1);
                      }}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        isActive={pageNumber === page}
                        onClick={(event) => {
                          event.preventDefault();
                          setPage(pageNumber);
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if (page < totalPages) setPage((prev) => prev + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
