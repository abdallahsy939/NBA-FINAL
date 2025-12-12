import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { nbaApi, TrendResult } from "@/services/nbaApi";
import { TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendAnalysisProps {
  playerId: number;
}

export function TrendAnalysis({ playerId }: TrendAnalysisProps) {
  const [stat, setStat] = useState("PTS");
  const [threshold, setThreshold] = useState("20");
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data: trend, isLoading, error } = useQuery({
    queryKey: ["trend", playerId, stat, threshold],
    queryFn: () => nbaApi.analyzeTrend(playerId, stat, parseFloat(threshold)),
    enabled: shouldFetch && !!playerId && !!threshold,
  });

  const handleAnalyze = () => {
    setShouldFetch(true);
  };

  const stats = [
    { value: "PTS", label: "Points" },
    { value: "REB", label: "Rebounds" },
    { value: "AST", label: "Assists" },
    { value: "PRA", label: "PRA" },
    { value: "PA", label: "PA" },
    { value: "PR", label: "PR" },
    { value: "AR", label: "AR" },
    { value: "STL", label: "Steals" },
    { value: "BLK", label: "Blocks" },
    { value: "FG3M", label: "3-Pointers" },
  ];

  return (
    <Card className="card-gradient border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Activity className="h-5 w-5 text-primary" />
          Trend Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">Analyze player performance trends</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Stat</label>
            <Select value={stat} onValueChange={setStat}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stats.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Threshold</label>
            <Input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="Enter threshold"
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-transparent">Action</label>
            <Button onClick={handleAnalyze} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Analyze
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Analyzing trend...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4">
            <p className="text-destructive text-sm">Failed to analyze trend. Please try again.</p>
          </div>
        )}

        {trend && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-secondary/50 p-4 rounded-lg text-center">
                <p className="text-3xl font-display font-bold text-primary">{trend.current_active_streak}</p>
                <p className="text-sm text-muted-foreground mt-1">Current Streak</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg text-center">
                <p className="text-3xl font-display font-bold text-nba-blue">{trend.total_hits}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Hits</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg text-center">
                <p
                  className={cn(
                    "text-3xl font-display font-bold",
                    trend.hit_rate_percent >= 60 ? "text-win" : "text-loss"
                  )}
                >
                  {trend.hit_rate_percent.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">Hit Rate</p>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-foreground flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{trend.message}</span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
