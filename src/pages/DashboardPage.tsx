// src/pages/DashboardPage.tsx
import { useState, useEffect } from "react";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { apiClient } from "../lib/api";
import type { DashboardRecord, PaginatedResponse } from "../lib/types";

import { DamageCard } from "../components/dashboard/DamageCard";
import { DamageModal } from "../components/dashboard/DamageModal";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

export default function DashboardPage() {
  const [records, setRecords] = useState<DashboardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isResolvedView, setIsResolvedView] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DashboardRecord | null>(
    null,
  );

  const limit = 12;

  const fetchDashboardData = async (
    currentPage: number,
    resolvedState: boolean,
  ) => {
    setLoading(true);
    try {
      const res = await apiClient.get<PaginatedResponse>(
        `/dashboard/?page=${currentPage}&limit=${limit}&resolved=${resolvedState}`,
      );
      setRecords(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      toast.error("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data whenever page or tab changes
  useEffect(() => {
    fetchDashboardData(page, isResolvedView);
  }, [page, isResolvedView]);

  const handleTabChange = (value: string) => {
    setIsResolvedView(value === "resolved");
    setPage(1); // Reset to first page when switching tabs
  };

  const handleStatusToggle = (imageId: string, newStatus: boolean) => {
    // If the new status doesn't match the current view, remove it from the list
    if (newStatus !== isResolvedView) {
      setRecords((prev) => prev.filter((r) => r.image_id !== imageId));
      setTotal((prev) => prev - 1);
    } else {
      // Just update the item in place if we are showing "All" (not applicable here, but safe fallback)
      setRecords((prev) =>
        prev.map((r) =>
          r.image_id === imageId ? { ...r, is_resolved: newStatus } : r,
        ),
      );
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8" /> Control Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage road damage detections.
          </p>
        </div>

        <Tabs
          defaultValue="pending"
          onValueChange={handleTabChange}
          className="w-100"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="resolved">Resolved History</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex justify-center items-center min-h-100">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
        </div>
      ) : records.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">No records found.</p>
          <p className="text-sm">
            Upload more images or switch tabs to view history.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {records.map((record) => (
            <DamageCard
              key={record.image_id}
              record={record}
              onViewDetails={setSelectedRecord}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
            of {total} records
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <div className="text-sm font-medium px-4">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* The Modal */}
      <DamageModal
        record={selectedRecord}
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onStatusToggle={handleStatusToggle}
      />
    </div>
  );
}
