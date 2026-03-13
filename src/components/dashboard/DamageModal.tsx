import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Check,
  Loader2,
  MapPin,
  ExternalLink,
  AlertTriangle,
  X,
} from "lucide-react";
import type { DashboardRecord } from "../../lib/types";
import { apiClient } from "../../lib/api";

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface DamageModalProps {
  record: DashboardRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusToggle: (imageId: string, newStatus: boolean) => void;
}

export function DamageModal({
  record,
  isOpen,
  onClose,
  onStatusToggle,
}: DamageModalProps) {
  const [resolving, setResolving] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !record) return null;

  const handleResolveToggle = async () => {
    setResolving(true);
    try {
      const res = await apiClient.patch(`/dashboard/${record.image_id}/toggle`);
      const newStatus = res.data.resolved;
      toast.success(`Marked as ${newStatus ? "Resolved" : "Pending"}`);
      onStatusToggle(record.image_id, newStatus);
      if (newStatus) onClose();
    } catch (error) {
      toast.error("Failed to update status.");
    } finally {
      setResolving(false);
    }
  };

  return (
    // Custom Backdrop Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Custom Modal Container - Forces wide layout */}
      <div className="relative w-full max-w-7xl h-[95vh] bg-background text-foreground border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Absolute Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-background/50 backdrop-blur rounded-full hover:bg-muted transition-colors border"
        >
          <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
        </button>

        {/* Fixed Header */}
        <div className="p-6 border-b shrink-0 flex flex-row items-start justify-between bg-muted/10 pr-20">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              Detection Report
              <Badge
                variant={record.is_resolved ? "default" : "destructive"}
                className="text-sm py-1"
              >
                {record.is_resolved ? "Resolved" : "Pending Action"}
              </Badge>
            </h2>
            <p className="text-sm font-mono text-muted-foreground">
              ID: {record.image_id}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black tracking-tighter text-primary">
              {record.rdi_score.toFixed(2)}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              RDI Score
            </div>
          </div>
        </div>

        {/* Scrollable Body: Split View */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
          {/* Left Side: Massive Image Viewer */}
          <div className="bg-muted/10 p-6 border-r flex flex-col overflow-hidden h-full">
            <Tabs
              defaultValue="processed"
              className="flex flex-col h-full w-full"
            >
              <div className="flex justify-between items-center mb-4 shrink-0">
                <TabsList className="grid w-100 grid-cols-2">
                  <TabsTrigger value="processed">Processed Output</TabsTrigger>
                  <TabsTrigger value="raw">Raw Upload</TabsTrigger>
                </TabsList>
                <div className="text-xs text-muted-foreground flex items-center gap-1 bg-background px-3 py-1.5 rounded-full border">
                  <ExternalLink className="w-3 h-3" /> Click image to view full
                  res
                </div>
              </div>

              {/* Processed Tab */}
              <TabsContent
                value="processed"
                className="flex-1 mt-0 relative rounded-lg border bg-black/20 flex items-center justify-center p-2 overflow-hidden"
              >
                {record.urls.processed ? (
                  <a
                    href={record.urls.processed}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full h-full flex items-center justify-center cursor-zoom-in"
                  >
                    <img
                      src={record.urls.processed}
                      alt="Processed"
                      className="max-w-full max-h-full object-contain rounded drop-shadow-2xl"
                      loading="lazy"
                    />
                  </a>
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center">
                    <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                    No processed output available
                  </div>
                )}
              </TabsContent>

              {/* Raw Tab */}
              <TabsContent
                value="raw"
                className="flex-1 mt-0 relative rounded-lg border bg-black/20 flex items-center justify-center p-2 overflow-hidden"
              >
                {record.urls.original ? (
                  <a
                    href={record.urls.original}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full h-full flex items-center justify-center cursor-zoom-in"
                  >
                    <img
                      src={record.urls.original}
                      alt="Raw"
                      className="max-w-full max-h-full object-contain rounded drop-shadow-2xl"
                      loading="lazy"
                    />
                  </a>
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center">
                    <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                    No raw image available
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Side: Data & Actions */}
          <div className="p-6 flex flex-col overflow-y-auto bg-background">
            <div className="flex-1 space-y-8">
              {/* Geolocation Block */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Location Data
                </h4>
                <div className="flex items-center gap-3 text-foreground bg-muted/50 p-4 rounded-lg border">
                  <MapPin className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-mono text-lg">
                      {record.coordinates[0]}
                    </div>
                    <div className="font-mono text-lg">
                      {record.coordinates[1]}
                    </div>
                  </div>
                </div>
              </div>

              {/* Damages Block */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Detected Anomalies
                </h4>
                {record.damage_summary.length > 0 ? (
                  <div className="space-y-3">
                    {record.damage_summary.map((dmg, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-4 border rounded-lg bg-card shadow-sm hover:border-primary/50 transition-colors"
                      >
                        <div>
                          <div className="font-bold text-base">{dmg.type}</div>
                          <div className="text-xs font-mono text-muted-foreground mt-1">
                            Class: {dmg.raw_code}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black bg-primary/10 text-primary px-2 py-1 rounded inline-block mb-1">
                            {dmg.count} Detected
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            Conf: {dmg.avg_confidence}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground bg-muted/20">
                    <Check className="w-8 h-8 mx-auto mb-3 text-green-500 opacity-50" />
                    <p className="font-medium">Clean Road Segment</p>
                    <p className="text-sm mt-1">
                      System detected no structural damage.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Resolve Button - Pinned to bottom of right col */}
            <div className="pt-6 mt-6 border-t shrink-0">
              <Button
                size="lg"
                onClick={handleResolveToggle}
                disabled={resolving}
                className={`w-full font-bold text-lg h-14 transition-all shadow-lg border-0 ${
                  record.is_resolved
                    ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground hover:shadow-destructive/25"
                    : "bg-green-600 hover:bg-green-500 text-white hover:shadow-green-500/25"
                }`}
              >
                {resolving ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Check className="w-5 h-5 mr-2" />
                )}
                {record.is_resolved ? "Revert to Pending" : "Mark as Resolved"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
