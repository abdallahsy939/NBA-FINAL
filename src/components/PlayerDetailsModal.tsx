import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { nbaApi, PlayerFullPrediction } from "@/services/nbaApi";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, Zap, Calendar, Target, X, Save } from "lucide-react";

interface PlayerDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  player: PlayerFullPrediction;
  opponentTeamName: string;
  opponentTeamId: string;
  homeTeamName?: string;
}

type StatCategory = "PTS" | "REB" | "AST" | "PRA";

const getProjectionValue = (
  player: PlayerFullPrediction,
  stat: StatCategory
): number => {
  if (stat === "PRA") return player.advanced_metrics_projected.PRA;
  return player.predicted_stats[stat] || 0;
};

export function PlayerDetailsModal({
  isOpen,
  onOpenChange,
  player,
  opponentTeamName,
  opponentTeamId,
  homeTeamName,
}: PlayerDetailsModalProps) {
  const [selectedStat, setSelectedStat] = useState<StatCategory>("PTS");
  const [bookmakerLine, setBookmakerLine] = useState("");
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [isSavingPrediction, setIsSavingPrediction] = useState(false);
  const { toast } = useToast();

  const projection = getProjectionValue(player, selectedStat);

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["player-details-history", player.player_id, opponentTeamId],
    queryFn: () =>
      nbaApi.getPlayerDetailsHistory(player.player_id, opponentTeamId),
    enabled: isOpen,
  });

  const { data: calculatorResult, refetch: analyzeCalculator } = useQuery({
    queryKey: [
      "calculator-analysis",
      player.player_id,
      projection,
      bookmakerLine,
      selectedStat,
    ],
    queryFn: () =>
      nbaApi.getCalculatorAnalysis(
        player.player_id,
        projection,
        parseFloat(bookmakerLine),
        selectedStat
      ),
    enabled: false,
  });

  const handleAnalyze = () => {
    if (bookmakerLine && parseFloat(bookmakerLine) > 0) {
      analyzeCalculator();
      setCalculatorOpen(true);
    }
  };

  const handleStatChange = (value: string) => {
    setSelectedStat(value as StatCategory);
    setCalculatorOpen(false);
  };

  const handleTrackPrediction = async () => {
    setIsSavingPrediction(true);
    try {
      const payload = {
        player_id: player.player_id,
        player_name: player.player,
        opponent_id: opponentTeamId,
        game_date: new Date().toISOString().split("T")[0],
        predicted_stats: player.predicted_stats,
        context: `Fatigue: ${player.context?.blowout_penalty || "N/A"}`,
      };

      await nbaApi.savePrediction(payload);

      toast({
        title: "Success!",
        description: `Prediction for ${player.player} saved successfully.`,
      });
    } catch (error) {
      console.error("Failed to save prediction:", error);
      toast({
        title: "Error",
        description: "Failed to save prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPrediction(false);
    }
  };

  const recentFormAvg = useMemo(() => {
    return historyData?.recent_form_avg || null;
  }, [historyData]);

  const h2hAverage = useMemo(() => {
    return historyData?.h2h_avg || null;
  }, [historyData]);

  const isPlayerHome = useMemo(() => {
    return homeTeamName && player.team === homeTeamName;
  }, [homeTeamName, player.team]);

  const getSelectedStatValue = (homeOrAway: "home" | "away"): number | null => {
    if (!historyData?.splits) return null;
    const splitData = homeOrAway === "home" ? historyData.splits.home : historyData.splits.away;
    if (!splitData) return null;
    return splitData[selectedStat] ?? null;
  };

  const getRecommendationColor = (advice: string | undefined, colorCode: string | undefined): string => {
    if (colorCode) {
      switch (colorCode.toLowerCase()) {
        case "green":
          return "bg-emerald-500/20 border-emerald-500/30 text-emerald-200";
        case "red":
          return "bg-red-500/20 border-red-500/30 text-red-200";
        case "amber":
        case "yellow":
          return "bg-amber-500/20 border-amber-500/30 text-amber-200";
        default:
          return "bg-slate-800/30 border-slate-700/50 text-slate-200";
      }
    }

    if (!advice) return "bg-slate-800/30 border-slate-700/50 text-slate-200";

    const upper = advice.toUpperCase();
    if (upper.includes("OVER")) return "bg-emerald-500/20 border-emerald-500/30 text-emerald-200";
    if (upper.includes("UNDER")) return "bg-red-500/20 border-red-500/30 text-red-200";
    return "bg-amber-500/20 border-amber-500/30 text-amber-200";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-700/50 p-4">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 p-2 hover:bg-slate-800 rounded-lg transition-colors z-10"
        >
          <X className="h-5 w-5 text-slate-400" />
        </button>

        {/* Hero Header Section */}
        <div className="mb-6 mt-2">
          <div className="flex items-start gap-8">
            {/* Player Headshot */}
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32 border-2 border-blue-500/30 ring-4 ring-blue-500/10">
                <AvatarImage
                  src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${player.player_id}.png`}
                  alt={player.player}
                />
                <AvatarFallback className="bg-slate-800 text-lg font-bold text-white">
                  {player.player.split(" ").map((n: string) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Player Info */}
            <div className="flex-1 flex flex-col justify-between h-32">
              <div>
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                  {player.player}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30 text-sm font-semibold">
                    {player.team}
                  </Badge>
                  {player.position && (
                    <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30 text-sm font-semibold">
                      {player.position}
                    </Badge>
                  )}
                  {player.archetype && (
                    <Badge className={`text-sm font-bold px-3 py-1 border ${
                      player.archetype.type.toLowerCase().includes("sniper")
                        ? "bg-blue-500/30 text-blue-200 border-blue-500/50"
                        : player.archetype.type.toLowerCase().includes("slasher")
                          ? "bg-red-500/30 text-red-200 border-red-500/50"
                          : "bg-cyan-500/30 text-cyan-200 border-cyan-500/50"
                    }`}>
                      {player.archetype.type.toLowerCase().includes("sniper")
                        ? "🎯 Sniper"
                        : player.archetype.type.toLowerCase().includes("slasher")
                          ? "⚡ Slasher"
                          : "🏀 Standard"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Opponent Info */}
            <div className="flex flex-col items-end gap-3 h-32 justify-between flex-shrink-0">
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Opponent</p>
                <Avatar className="h-16 w-16 mx-auto border-2 border-slate-700/50 bg-slate-800">
                  <AvatarImage
                    src={`https://cdn.nba.com/logos/nba/${opponentTeamId}/global/L/logo.svg`}
                    alt={opponentTeamName}
                  />
                  <AvatarFallback className="bg-slate-800 text-xs font-bold text-slate-300">
                    {opponentTeamName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              {player.matchup_analysis?.description && (
                <div className="text-right">
                  <Badge
                    className={`text-xs font-bold px-4 py-1.5 border-2 ${
                      player.matchup_analysis.description.includes("🔴")
                        ? "bg-red-950/40 text-red-200 border-red-500/50 shadow-lg shadow-red-500/20"
                        : player.matchup_analysis.description.includes("🟢")
                          ? "bg-emerald-950/40 text-emerald-200 border-emerald-500/50 shadow-lg shadow-emerald-500/20"
                          : "bg-amber-950/40 text-amber-200 border-amber-500/50 shadow-lg shadow-amber-500/20"
                    }`}
                  >
                    {player.matchup_analysis.description}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Context Banner */}
        {historyData?.fatigue && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="backdrop-blur-md bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Fatigue Status</p>
                  <p className="text-sm font-semibold text-white mt-1">
                    {historyData.fatigue.status}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {historyData.fatigue.last_min.toFixed(0)} min last game
                    {historyData.fatigue.days_rest > 0 ? ` • ${historyData.fatigue.days_rest} day${historyData.fatigue.days_rest !== 1 ? 's' : ''} rest` : " • Back-to-back"}
                  </p>
                </div>
              </div>
            </div>

            {historyData?.splits && (historyData.splits.home || historyData.splits.away) && (
              <div className="backdrop-blur-md bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Playing Location</p>
                    <p className="text-sm font-semibold text-white mt-1">
                      {isPlayerHome ? "Home Court" : "Away"}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {player.team} vs {opponentTeamName}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Deep Analytics Section */}
        {(player.shot_quality_analysis || player.lineup_synergy) && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-400" />
              Deep Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Shot Quality Widget */}
              {player.shot_quality_analysis && (
                <Card className="bg-slate-800/40 border-slate-700/50">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">Shot Quality</p>
                        <Badge className={`text-sm font-bold px-3 py-2 border ${
                          player.shot_quality_analysis.tier === "SUPERSTAR_CREATOR"
                            ? "bg-yellow-500/30 text-yellow-200 border-yellow-500/50"
                            : player.shot_quality_analysis.tier === "TOUGH_SHOT_MAKER"
                              ? "bg-purple-500/30 text-purple-200 border-purple-500/50"
                              : player.shot_quality_analysis.tier === "SPOT_UP_SPECIALIST"
                                ? "bg-blue-500/30 text-blue-200 border-blue-500/50"
                                : "bg-slate-700/40 text-slate-200 border-slate-600/50"
                        }`}>
                          {player.shot_quality_analysis.tier === "SUPERSTAR_CREATOR"
                            ? "🌟 Elite Creator"
                            : player.shot_quality_analysis.tier === "TOUGH_SHOT_MAKER"
                              ? "💪 Tough Shot Maker"
                              : player.shot_quality_analysis.tier === "SPOT_UP_SPECIALIST"
                                ? "🎯 Spot-Up"
                                : "📊 Standard"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium mb-1">Reasoning</p>
                        <p className="text-sm text-slate-300">{player.shot_quality_analysis.reasoning}</p>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
                        <p className="text-xs text-slate-400 font-medium mb-2">Projection Impact</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            <span className="text-slate-400">Before: </span>
                            <span className="font-bold text-amber-300">{player.shot_quality_analysis.pts_before.toFixed(1)}</span>
                          </span>
                          <span className="text-slate-500">→</span>
                          <span className="text-sm">
                            <span className="text-slate-400">After: </span>
                            <span className={`font-bold ${player.shot_quality_analysis.pts_after < player.shot_quality_analysis.pts_before ? "text-red-300" : "text-emerald-300"}`}>
                              {player.shot_quality_analysis.pts_after.toFixed(1)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lineup Synergy Widget */}
              {player.lineup_synergy && (
                <Card className="bg-slate-800/40 border-slate-700/50">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Lineup Synergy</p>
                      <div className={`rounded-lg p-4 border-2 backdrop-blur-sm ${
                        player.lineup_synergy.impact_pct > 0
                          ? "bg-emerald-500/20 border-emerald-500/30"
                          : player.lineup_synergy.impact_pct < 0
                            ? "bg-red-500/20 border-red-500/30"
                            : "bg-slate-700/20 border-slate-600/30"
                      }`}>
                        {player.lineup_synergy.impact_pct > 0 ? (
                          <>
                            <p className="text-2xl font-bold text-emerald-300 mb-2">
                              🔥 +{player.lineup_synergy.impact_pct.toFixed(1)}% Boost
                            </p>
                            <p className="text-sm text-emerald-200/90">
                              Exceptional lineup chemistry enhancing team performance
                            </p>
                          </>
                        ) : player.lineup_synergy.impact_pct < 0 ? (
                          <>
                            <p className="text-2xl font-bold text-red-300 mb-2">
                              ⚠️ {player.lineup_synergy.impact_pct.toFixed(1)}% Penalty
                            </p>
                            <p className="text-sm text-red-200/90">
                              Spacing issues affecting team fit
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-slate-300 mb-2">
                              ⚖️ Neutral Chemistry
                            </p>
                            <p className="text-sm text-slate-300/90">
                              Balanced team synergy
                            </p>
                          </>
                        )}
                      </div>
                      <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-400 font-medium mb-1">Synergy Multiplier</p>
                        <p className="text-xl font-bold text-cyan-300">
                          {player.lineup_synergy.multiplier.toFixed(3)}x
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Projections Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan-400" />
            Performance Forecast
          </h2>
          <Card className="bg-slate-800/40 border-slate-700/50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-5xl font-black text-cyan-400 mb-2">
                    {player.predicted_stats.MIN.toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Minutes</p>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-black text-amber-400 mb-2">
                    {player.predicted_stats.PTS.toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Points</p>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-black text-emerald-400 mb-2">
                    {player.advanced_metrics_projected.PRA.toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Projection</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History & Form Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            Performance History
          </h2>
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-slate-700/50">
              <TabsTrigger value="recent" className="text-xs uppercase">Recent Form (6 Games)</TabsTrigger>
              <TabsTrigger value="h2h" className="text-xs uppercase">vs {opponentTeamName}</TabsTrigger>
            </TabsList>

            {/* Recent Form Tab */}
            <TabsContent value="recent" className="space-y-4 pt-4">
              {historyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                </div>
              ) : recentFormAvg ? (
                <div className="space-y-4">
                  {historyData?.splits && (historyData.splits.home || historyData.splits.away) && (
                    <Card className="bg-slate-800/30 border-slate-700/50">
                      <CardContent className="pt-6">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-4">
                          Home vs Away - {selectedStat}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          {historyData.splits.home && (
                            <div className={`p-4 rounded-lg border transition-all backdrop-blur-sm ${
                              isPlayerHome
                                ? "bg-blue-500/20 border-blue-500/30 ring-1 ring-blue-500/50"
                                : "bg-slate-700/20 border-slate-700/50"
                            }`}>
                              <p className="text-xs text-slate-400 font-semibold mb-2 uppercase">Home Court</p>
                              <p className="text-3xl font-bold text-blue-300">
                                {getSelectedStatValue("home")?.toFixed(1) || "-"}
                              </p>
                              <p className="text-xs text-slate-400 mt-2">
                                {historyData.splits.home.GP} games
                              </p>
                            </div>
                          )}
                          {historyData.splits.away && (
                            <div className={`p-4 rounded-lg border transition-all backdrop-blur-sm ${
                              !isPlayerHome
                                ? "bg-amber-500/20 border-amber-500/30 ring-1 ring-amber-500/50"
                                : "bg-slate-700/20 border-slate-700/50"
                            }`}>
                              <p className="text-xs text-slate-400 font-semibold mb-2 uppercase">Away</p>
                              <p className="text-3xl font-bold text-amber-300">
                                {getSelectedStatValue("away")?.toFixed(1) || "-"}
                              </p>
                              <p className="text-xs text-slate-400 mt-2">
                                {historyData.splits.away.GP} games
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-4 gap-3">
                    <StatBoxDark label="PTS" value={recentFormAvg.PTS} color="text-amber-300" />
                    <StatBoxDark label="REB" value={recentFormAvg.REB} color="text-blue-300" />
                    <StatBoxDark label="AST" value={recentFormAvg.AST} color="text-emerald-300" />
                    <StatBoxDark label="PRA" value={recentFormAvg.PRA} color="text-purple-300" highlight={true} />
                    <StatBoxDark label="Pts+Ast" value={recentFormAvg.PA} color="text-pink-300" />
                    <StatBoxDark label="Pts+Reb" value={recentFormAvg.PR} color="text-indigo-300" />
                    <StatBoxDark label="STL" value={recentFormAvg.STL} color="text-orange-300" />
                    <StatBoxDark label="BLK" value={recentFormAvg.BLK} color="text-gray-300" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 bg-slate-800/20 rounded-lg">
                  No recent data available
                </div>
              )}
            </TabsContent>

            {/* H2H Tab */}
            <TabsContent value="h2h" className="space-y-4 pt-4">
              {historyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                </div>
              ) : h2hAverage && h2hAverage.GP > 0 ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Average vs {opponentTeamName} ({h2hAverage.GP} games)
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    <StatBoxDark label="PTS" value={h2hAverage.PTS} color="text-amber-300" />
                    <StatBoxDark label="REB" value={h2hAverage.REB} color="text-blue-300" />
                    <StatBoxDark label="AST" value={h2hAverage.AST} color="text-emerald-300" />
                    <StatBoxDark label="PRA" value={h2hAverage.PRA} color="text-purple-300" highlight={true} />
                    <StatBoxDark label="Pts+Ast" value={h2hAverage.PA} color="text-pink-300" />
                    <StatBoxDark label="Pts+Reb" value={h2hAverage.PR} color="text-indigo-300" />
                    <StatBoxDark label="STL" value={h2hAverage.STL} color="text-orange-300" />
                    <StatBoxDark label="BLK" value={h2hAverage.BLK} color="text-gray-300" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 bg-slate-800/20 rounded-lg">
                  No head-to-head history
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Analysis Calculator */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Projection Analyzer
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Statistic</label>
                <Select value={selectedStat} onValueChange={handleStatChange}>
                  <SelectTrigger className="h-10 bg-slate-800/50 border-slate-700/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="PTS">Points (PTS)</SelectItem>
                    <SelectItem value="REB">Rebounds (REB)</SelectItem>
                    <SelectItem value="AST">Assists (AST)</SelectItem>
                    <SelectItem value="PRA">Projection (PRA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Target Line</label>
                <Input
                  type="number"
                  placeholder="e.g., 22.5"
                  value={bookmakerLine}
                  onChange={(e) => setBookmakerLine(e.target.value)}
                  step="0.5"
                  className="h-10 bg-slate-800/50 border-slate-700/50 text-white"
                />
              </div>
            </div>

            <Card className="bg-gradient-to-r from-slate-800/40 to-slate-700/30 border-slate-700/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Our Forecast</p>
                    <p className="text-3xl font-bold text-cyan-300 mt-2">{projection.toFixed(1)}</p>
                  </div>
                  {bookmakerLine && (
                    <>
                      <div className="h-12 border-l border-slate-700/50"></div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Difference</p>
                        <p className={`text-3xl font-bold mt-2 ${
                          (projection - parseFloat(bookmakerLine)) > 0 ? "text-emerald-300" : "text-red-300"
                        }`}>
                          {(projection - parseFloat(bookmakerLine)) > 0 ? "+" : ""}
                          {(projection - parseFloat(bookmakerLine)).toFixed(1)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleAnalyze}
              disabled={!bookmakerLine || parseFloat(bookmakerLine) <= 0}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 h-11"
              size="lg"
            >
              Analyze Projection
            </Button>

            {calculatorOpen && calculatorResult && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <Card className={`${getRecommendationColor(calculatorResult.advice, calculatorResult.color_code)} border-2`}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm font-bold uppercase tracking-wider">{calculatorResult.advice}</span>
                      <span className="text-4xl font-black">{(calculatorResult.probability_over).toFixed(0)}%</span>
                    </div>
                    <Progress value={calculatorResult.probability_over} className="h-3 bg-black/20" />
                    <p className="text-xs text-center mt-4 opacity-90 font-semibold">
                      Over: {calculatorResult.probability_over.toFixed(1)}% | Under: {calculatorResult.probability_under.toFixed(1)}%
                    </p>
                    {calculatorResult.confidence && (
                      <p className="text-xs text-center mt-4 opacity-85 italic">
                        {calculatorResult.confidence}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Track Prediction Button - Footer */}
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <Button
            onClick={handleTrackPrediction}
            disabled={isSavingPrediction}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 h-12"
            size="lg"
          >
            <Save className="h-5 w-5 mr-2" />
            {isSavingPrediction ? "Saving..." : "Track Prediction"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatBoxDark({ label, value, color = "text-slate-300", highlight = false }: { label: string, value: number | undefined, color?: string, highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 text-center border transition-all ${
      highlight
        ? "bg-purple-500/20 border-purple-500/30"
        : "bg-slate-800/40 border-slate-700/50"
    }`}>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-black mt-2 ${color}`}>
        {value?.toFixed(1) || "-"}
      </p>
    </div>
  );
}
