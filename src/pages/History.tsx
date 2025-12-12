import { useEffect, useState } from "react";
import { nbaApi, PredictionRecord } from "@/services/nbaApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, TrendingUp, Calendar } from "lucide-react";

export function History() {
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const data = await nbaApi.getPredictionHistory();
        setPredictions(data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch prediction history:", err);
        setError("Failed to load prediction history");
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getAccuracyBadge = (prediction: PredictionRecord) => {
    if (prediction.status === "pending") {
      return (
        <Badge className="bg-slate-500/20 text-slate-200 border-slate-500/30">
          Waiting for results...
        </Badge>
      );
    }

    if (!prediction.actual_stats) {
      return (
        <Badge className="bg-slate-500/20 text-slate-200 border-slate-500/30">
          No data
        </Badge>
      );
    }

    const predictedPts = prediction.predicted_stats.PTS || 0;
    const actualPts = prediction.actual_stats.PTS || 0;
    const diff = Math.abs(predictedPts - actualPts);

    let badgeColor = "bg-red-500/20 text-red-200 border-red-500/30";
    let label = "Off";

    if (diff < 2) {
      badgeColor = "bg-emerald-500/20 text-emerald-200 border-emerald-500/30";
      label = "Accurate";
    } else if (diff < 5) {
      badgeColor = "bg-amber-500/20 text-amber-200 border-amber-500/30";
      label = "Close";
    }

    return (
      <div className="flex flex-col items-start gap-1">
        <Badge className={`${badgeColor} border`}>
          {label} ({diff.toFixed(1)} off)
        </Badge>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-lg border border-purple-500/30">
              <TrendingUp className="h-6 w-6 text-purple-300" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white font-display">
                Prediction History
              </h1>
              <p className="text-blue-300/70 mt-1">
                Track your player predictions and accuracy
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {!isLoading && predictions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-slate-800/40 border-slate-700/50">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-2">
                  Total Predictions
                </p>
                <p className="text-3xl font-bold text-cyan-300">
                  {predictions.length}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/40 border-slate-700/50">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-2">
                  Completed
                </p>
                <p className="text-3xl font-bold text-emerald-300">
                  {predictions.filter((p) => p.status === "completed").length}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/40 border-slate-700/50">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-2">
                  Pending
                </p>
                <p className="text-3xl font-bold text-amber-300">
                  {predictions.filter((p) => p.status === "pending").length}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Card className="bg-slate-800/40 border-slate-700/50">
          <CardHeader className="border-b border-slate-700/50">
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5 text-cyan-400" />
              Recent Predictions
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 font-semibold">{error}</p>
              </div>
            ) : predictions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 font-semibold">
                  No predictions tracked yet
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Start tracking predictions from the player details modal
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700/50 hover:bg-transparent">
                      <TableHead className="text-slate-300 font-semibold">
                        Date
                      </TableHead>
                      <TableHead className="text-slate-300 font-semibold">
                        Player
                      </TableHead>
                      <TableHead className="text-slate-300 font-semibold">
                        Context
                      </TableHead>
                      <TableHead className="text-slate-300 font-semibold">
                        Projection vs Reality
                      </TableHead>
                      <TableHead className="text-slate-300 font-semibold text-right">
                        Accuracy
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictions.map((prediction) => (
                      <TableRow
                        key={prediction.id}
                        className="border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                      >
                        <TableCell className="text-slate-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            {formatDate(prediction.game_date)}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border-slate-600 bg-slate-800">
                              <AvatarImage
                                src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${prediction.player_id}.png`}
                                alt={prediction.player_name}
                              />
                              <AvatarFallback className="bg-slate-700 text-xs font-bold text-white">
                                {prediction.player_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold">
                              {prediction.player_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm max-w-xs">
                          <span className="truncate">{prediction.context}</span>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {prediction.status === "pending" ? (
                            <span className="text-amber-300 text-sm font-semibold">
                              Waiting for results...
                            </span>
                          ) : prediction.actual_stats ? (
                            <div className="text-sm">
                              <p className="text-cyan-300">
                                Proj: {prediction.predicted_stats.PTS?.toFixed(1) || "—"}
                              </p>
                              <p className="text-emerald-300">
                                Real: {prediction.actual_stats.PTS?.toFixed(1) || "—"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {getAccuracyBadge(prediction)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default History;
