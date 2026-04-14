"use client";

import React, { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CalendarIcon, CheckCircle2, Filter, Search, Send } from "lucide-react";
import { useQuery } from "urql";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Calendar } from "~~/components/ui/calendar";
import { Checkbox } from "~~/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~~/components/ui/dialog";
import { Input } from "~~/components/ui/input";
import { Label } from "~~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~~/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~~/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/ui/table";
import { Textarea } from "~~/components/ui/textarea";
import { GET_PATIENT_RECORDS_QUERY } from "~~/graphql/queries/doctor";
import { categories, categoryColors } from "~~/lib/mockData";
import { cn } from "~~/lib/utils";

const ITEMS_PER_PAGE = 10;
export default function QueryPatientPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = use(params);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [requestOpen, setRequestOpen] = useState(false);
  const [duration, setDuration] = useState("");
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const [{ data: patientData, fetching: patientFetching }] = useQuery({
    query: GET_PATIENT_RECORDS_QUERY,
    variables: { cardHash: patientId, limit: ITEMS_PER_PAGE, offset },
    //requestPolicy: "cache-and-network",
    pause: patientId === undefined,
  });

  const patient = !patientFetching ? patientData.patients.items[0] : undefined;

  const filtered = useMemo(() => {
    if (!patientData?.patients?.items?.length) return [];
    // Access the array from your specific query structure
    const firstPatient = patientData.patients.items[0];

    const records = firstPatient?.records?.items || [];

    return records?.filter((r: any) => {
      // Category Filter
      if (categoryFilter !== "All" && r.category !== categoryFilter) return false;

      // Search Query (Filename, UploadedBy, Facility)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          r.description?.toLowerCase().includes(q) ||
          r.doctor.name?.toLowerCase().includes(q) ||
          r.doctor.institution?.toLowerCase().includes(q);

        if (!matchesSearch) return false;
      }

      // Date Range Filters
      const recordDate = new Date(Number(r.timestamp) * 1000);
      if (dateFrom) {
        // Ensure dateFrom is compared at the very start of the day
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (recordDate < from) return false;
      }

      if (dateTo) {
        // Ensure dateTo is compared at the very end of the day (23:59:59)
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (recordDate > to) return false;
      }

      return true;
    });

    // Dependency array includes 'data' so it re-runs when the query updates
  }, [patientData, categoryFilter, searchQuery, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(offset, currentPage * ITEMS_PER_PAGE);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (paginated.every((r: any) => selectedIds.has(r.id))) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        paginated.forEach((r: any) => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        paginated.forEach((r: any) => next.add(r.id));
        return next;
      });
    }
  };

  const allChecked = paginated.length > 0 && paginated.every((r: any) => selectedIds.has(r.id));

  const handleSendRequest = () => {
    if (selectedIds.size === 0 || !duration) return;
    setSent(true);
    console.log({ selectedIds, duration, reason });
    setTimeout(() => {
      setSent(false);
      setSelectedIds(new Set());
      setDuration("");
      setReason("");
      setRequestOpen(false);
    }, 2000);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("All");
    setDateFrom(undefined);
    setDateTo(undefined);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={router.back}
              className="shrink-0 rounded-full hover:cursor-pointer hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Request Access</h1>
              <p className="text-sm text-muted-foreground">
                Select records to request from <span className="font-medium text-foreground">{patient?.name}</span>
              </p>
            </div>
          </div>
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Button className="gap-2" onClick={() => setRequestOpen(true)}>
                  <Send className="w-4 h-4" />
                  Request {selectedIds.size} Record{selectedIds.size > 1 ? "s" : ""}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search records, doctors, facilities..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={v => {
                setCategoryFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-1.5 text-sm", dateFrom && "text-foreground")}>
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={d => {
                    setDateFrom(d);
                    setCurrentPage(1);
                  }}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-1.5 text-sm", dateTo && "text-foreground")}>
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {dateTo ? format(dateTo, "MMM d, yyyy") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={d => {
                    setDateTo(d);
                    setCurrentPage(1);
                  }}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {(searchQuery || categoryFilter !== "All" || dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground">
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[40px]">
                  <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Record Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Facility</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No records match your filters
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((record: any, i: number) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50 cursor-pointer",
                      selectedIds.has(record.id) && "bg-primary/5",
                    )}
                    onClick={() => toggleSelect(record.id)}
                  >
                    <td className="p-4">
                      <Checkbox
                        checked={selectedIds.has(record.id)}
                        onCheckedChange={() => toggleSelect(record.id)}
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-4">
                      <span
                        className={cn("text-xs px-2 py-1 rounded-full font-medium", categoryColors[record.category])}
                      >
                        {record.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium">{record.description}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {format(new Date(Number(record.timestamp) * 1000), "MMM d, yyyy")}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{record.doctor.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      <Badge variant={record.isVerified ? "success" : "destructive"}>
                        {record.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{record.doctor.institution}</td>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}

          <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/20">
            <p className="text-xs text-muted-foreground">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""} · Page {currentPage} of {totalPages}
              {selectedIds.size > 0 && (
                <span className="ml-2 text-primary font-medium">({selectedIds.size} selected)</span>
              )}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="text-xs h-7"
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="text-xs h-7 w-7 p-0"
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="text-xs h-7"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        open={requestOpen}
        onOpenChange={v => {
          if (!v) {
            setRequestOpen(false);
            setSent(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Confirm Access Request
            </DialogTitle>
          </DialogHeader>
          {sent ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-8 flex flex-col items-center gap-3"
            >
              <CheckCircle2 className="w-12 h-12 text-secondary" />
              <p className="font-medium">Request sent</p>
              <p className="text-xs text-muted-foreground text-center">
                Waiting for {patient?.name} to approve access to {selectedIds.size} record
                {selectedIds.size > 1 ? "s" : ""}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Requesting access to{" "}
                <span className="font-medium text-foreground">
                  {selectedIds.size} record{selectedIds.size > 1 ? "s" : ""}
                </span>{" "}
                from <span className="font-medium text-foreground">{patient?.name}</span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 bg-muted/30 rounded-lg p-3">
                {paginated
                  .filter((r: any) => selectedIds.has(r.id))
                  .map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between text-xs">
                      <span className="font-medium">{r.description}</span>
                      <span className={cn("px-1.5 py-0.5 rounded-full", categoryColors[r.category])}>{r.category}</span>
                    </div>
                  ))}
              </div>
              <div className="space-y-2">
                <Label>Access Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="24h">24 Hours</SelectItem>
                    <SelectItem value="48h">48 Hours</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reason (optional)</Label>
                <Textarea
                  placeholder="e.g. Follow-up consultation review"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="resize-none h-20"
                />
              </div>
              <Button className="w-full gap-2" disabled={!duration} onClick={handleSendRequest}>
                <Send className="w-4 h-4" />
                Send Request
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
