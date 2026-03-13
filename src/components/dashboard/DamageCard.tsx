import { MapPin, AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { DashboardRecord } from "../../lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface DamageCardProps {
  record: DashboardRecord;
  onViewDetails: (record: DashboardRecord) => void;
}

export function DamageCard({ record, onViewDetails }: DamageCardProps) {
  const primaryDamage = record.damage_summary[0]; // The highest count damage

  return (
    <Card className="flex flex-col justify-between bg-card text-card-foreground border-border hover:border-primary/50 transition-colors shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <Badge
            variant={
              record.priority_status === "CRITICAL"
                ? "destructive"
                : "secondary"
            }
            className="mb-2 flex items-center gap-1 w-fit"
          >
            {record.priority_status === "CRITICAL" ? (
              <AlertTriangle className="w-3 h-3" />
            ) : (
              <Info className="w-3 h-3" />
            )}
            {record.priority_status}
          </Badge>
          <div
            className="text-sm text-muted-foreground truncate w-40"
            title={record.image_id}
          >
            ID: {record.image_id.split("-")[0]}...
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-3xl font-black tracking-tighter">
            {record.rdi_score.toFixed(2)}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
            RDI Score
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-sm flex-1">
        <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-md w-fit">
          <MapPin className="w-4 h-4 text-foreground" />
          <span className="font-mono text-xs">
            {record.coordinates[0]}, {record.coordinates[1]}
          </span>
        </div>

        <div className="bg-muted/50 p-4 rounded-md border border-border/50">
          {primaryDamage ? (
            <>
              <div className="font-semibold text-base flex justify-between items-center">
                <span>{primaryDamage.type}</span>
                <Badge variant="outline">{primaryDamage.count}x</Badge>
              </div>
              <div className="text-muted-foreground text-xs mt-2 flex justify-between">
                <span>Max Confidence:</span>
                <span className="font-mono text-foreground">
                  {primaryDamage.max_confidence}
                </span>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground italic flex items-center gap-2 py-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              No severe damages logged.
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant={record.is_resolved ? "secondary" : "default"}
          className="w-full font-semibold"
          onClick={() => onViewDetails(record)}
        >
          {record.is_resolved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" /> View Resolved Details
            </>
          ) : (
            "Review & Resolve"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
