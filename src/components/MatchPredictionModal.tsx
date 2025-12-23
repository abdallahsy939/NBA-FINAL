import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { nbaApi, TodayGame, Player, PlayerStatSave, MatchSaveRequest, MatchPrediction, PlayerFullPrediction, InteractiveMatchPrediction } from "@/services/nbaApi";
import {
  Brain,
  Zap,
  X,
  ChevronsUpDown,
  AlertCircle,
  ChevronRight,
  BookmarkCheck,
} from "lucide-react";
import { getTeamCode } from "@/lib/teamMapping";
import {
  getFatigueFactor,
  getRestBadge,
} from "@/lib/fatigueUtils";
import { BlowoutBar } from "@/components/BlowoutBar";
import { ShootingBattleCard } from "@/components/ShootingBattleCard";
import { PlayerDetailsModal } from "@/components/PlayerDetailsModal";
import { toast } from "sonner";

interface MatchPredictionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game: TodayGame | null;
}

const getLogo = (id: string | undefined) =>
  id ? `https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg` : null;

const getConfidenceLevel = (spread: number): string => {
  const absSpread = Math.abs(spread);
  if (absSpread < 2) return "Tight";
  if (absSpread < 5) return "Solid";
  return "Blowout";
};

export function MatchPredictionModal({
  open,
  onOpenChange,
  game,
}: MatchPredictionModalProps) {
  const [homeMissingPlayers, setHomeMissingPlayers] = useState<Player[]>([]);
  const [awayMissingPlayers, setAwayMissingPlayers] = useState<Player[]>([]);
  const [homeSearchQuery, setHomeSearchQuery] = useState("");
  const [awaySearchQuery, setAwaySearchQuery] = useState("");
  const [homePopoverOpen, setHomePopoverOpen] = useState(false);
  const [awayPopoverOpen, setAwayPopoverOpen] = useState(false);
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerFullPrediction | null>(null);
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [modalTeam, setModalTeam] = useState<"home" | "away">("home");

  const homeTeamId = game ? getTeamCode(game.homeTeam) : "";
  const awayTeamId = game ? getTeamCode(game.awayTeam) : "";

  const { data: homeRoster = [] } = useQuery({
    queryKey: ["team-roster", homeTeamId],
    queryFn: () => nbaApi.getTeamRoster(homeTeamId),
    enabled: !!homeTeamId,
  });

  const { data: awayRoster = [] } = useQuery({
    queryKey: ["team-roster", awayTeamId],
    queryFn: () => nbaApi.getTeamRoster(awayTeamId),
    enabled: !!awayTeamId,
  });

  const homePlayerSearchResults = homeRoster.filter((player) =>
    player.full_name.toLowerCase().includes(homeSearchQuery.toLowerCase())
  );

  const awayPlayerSearchResults = awayRoster.filter((player) =>
    player.full_name.toLowerCase().includes(awaySearchQuery.toLowerCase())
  );

  // Fetch match prediction (for main analysis: winner, spread, confidence)
  const {
    data: prediction,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: [
      "match-prediction",
      homeTeamId,
      awayTeamId,
      homeMissingPlayers.map((p) => p.id).join(","),
      awayMissingPlayers.map((p) => p.id).join(","),
    ],
    queryFn: async () => {
      return await nbaApi.predictMatch(
        homeTeamId,
        awayTeamId,
        homeMissingPlayers.map((p) => p.id),
        awayMissingPlayers.map((p) => p.id)
      );
    },
    enabled: open && !!homeTeamId && !!awayTeamId,
  });

  // Fetch full match prediction with player data (for player projections in list)
  const { data: fullPrediction } = useQuery({
    queryKey: [
      "full-match-prediction",
      homeTeamId,
      awayTeamId,
      homeMissingPlayers.map((p) => p.id).join(","),
      awayMissingPlayers.map((p) => p.id).join(","),
    ],
    queryFn: async () => {
      return await nbaApi.getFullMatchPredictionWithAbsents(
        homeTeamId,
        awayTeamId,
        homeMissingPlayers.map((p) => p.id),
        awayMissingPlayers.map((p) => p.id)
      );
    },
    enabled: open && !!homeTeamId && !!awayTeamId,
  });

  const handlePlayerClick = useCallback(
    (player: PlayerFullPrediction, team: "home" | "away") => {
      setSelectedPlayer(player);
      setModalTeam(team);
      setPlayerModalOpen(true);
    },
    []
  );

  const addHomeMissingPlayer = useCallback(
    (player: Player) => {
      if (!homeMissingPlayers.find((p) => p.id === player.id)) {
        setHomeMissingPlayers([...homeMissingPlayers, player]);
      }
      setHomeSearchQuery("");
      setHomePopoverOpen(false);
    },
    [homeMissingPlayers]
  );

  const addAwayMissingPlayer = useCallback(
    (player: Player) => {
      if (!awayMissingPlayers.find((p) => p.id === player.id)) {
        setAwayMissingPlayers([...awayMissingPlayers, player]);
      }
      setAwaySearchQuery("");
      setAwayPopoverOpen(false);
    },
    [awayMissingPlayers]
  );

  const removeHomeMissingPlayer = useCallback(
    (playerId: number) => {
      setHomeMissingPlayers(homeMissingPlayers.filter((p) => p.id !== playerId));
    },
    [homeMissingPlayers]
  );

  const removeAwayMissingPlayer = useCallback(
    (playerId: number) => {
      setAwayMissingPlayers(awayMissingPlayers.filter((p) => p.id !== playerId));
    },
    [awayMissingPlayers]
  );

  const handleSaveMatch = useCallback(async () => {
    if (!game || !prediction) return;

    try {
      setIsSaving(true);

      const homeTeamIdNum = typeof game.homeTeamId === "string" ? parseInt(game.homeTeamId) : game.homeTeamId;
      const awayTeamIdNum = typeof game.awayTeamId === "string" ? parseInt(game.awayTeamId) : game.awayTeamId;

      if (!homeTeamIdNum || !awayTeamIdNum) {
        toast.error("Team IDs not available");
        return;
      }

      // Fetch full match prediction with player data for saving
      const fullPrediction = await nbaApi.getFullMatchPredictionWithAbsents(
        homeTeamId,
        awayTeamId,
        homeMissingPlayers.map((p) => p.id),
        awayMissingPlayers.map((p) => p.id)
      );

      const formatPlayerStats = (player: any): PlayerStatSave => {
        return {
          player_id: player.player_id,
          name: player.player,
          team: player.team,
          predicted_stats: {
            PTS: player.predicted_stats?.PTS || 0,
            REB: player.predicted_stats?.REB || 0,
            AST: player.predicted_stats?.AST || 0,
            MIN: player.predicted_stats?.MIN || 0,
            PRA: player.advanced_metrics_projected?.PRA || 0,
          },
        };
      };

      const saveRequest: MatchSaveRequest = {
        game_id: game.gameId,
        game_date: game.gameDate,
        home_team: game.homeTeam,
        home_team_id: homeTeamIdNum,
        away_team: game.awayTeam,
        away_team_id: awayTeamIdNum,
        home_players: fullPrediction.home_players.map(formatPlayerStats),
        away_players: fullPrediction.away_players.map(formatPlayerStats),
        winner_prediction: prediction.predicted_winner,
      };

      await nbaApi.saveMatchPrediction(saveRequest);

      toast.success("Match & Projections saved to History");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save match";
      toast.error(errorMessage);
      console.error("Save match error:", error);
    } finally {
      setIsSaving(false);
    }
  }, [game, prediction, homeTeamId, awayTeamId, homeMissingPlayers, awayMissingPlayers]);

  const getConfidenceBadgeColor = (level: string | undefined | null) => {
    if (!level) return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    const lower = level.toLowerCase();
    if (lower.includes("indécis") || lower.includes("tight") || lower.includes("serré"))
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    if (lower.includes("solid") || lower.includes("solide"))
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (lower.includes("blowout"))
      return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const getWinnerGradient = (winner: string) => {
    return winner === game?.homeTeam
      ? "from-purple-600/20 to-purple-500/10"
      : "from-amber-600/20 to-amber-500/10";
  };

  const renderFatigueSection = (
    teamName: string | undefined,
    factors: string[] | undefined
  ) => {
    const factorsList = factors || [];
    const hasFactors = factorsList.length > 0;

    return (
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-foreground">{teamName}</h4>
        <div className="flex flex-wrap gap-1.5">
          {hasFactors ? (
            factorsList.map((factor, idx) => {
              const fatigueInfo = getFatigueFactor(factor);
              return (
                <Badge
                  key={idx}
                  className={`text-[10px] py-0.5 px-2 border ${fatigueInfo.bgColor} ${fatigueInfo.color}`}
                >
                  <AlertCircle className="h-2.5 w-2.5 mr-1" />
                  {fatigueInfo.name}
                </Badge>
              );
            })
          ) : (
            <Badge
              className={`text-[10px] py-0.5 px-2 border ${
                getRestBadge().bgColor
              } ${getRestBadge().color}`}
            >
              {getRestBadge().icon} {getRestBadge().name}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  const handleLogoError = (teamId: string) => {
    setFailedLogos((prev) => new Set([...prev, teamId]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 1. RÉDUCTION DE LA TAILLE ICI (max-w-[850px] et max-h-[85vh]) */}
      <DialogContent className="sm:max-w-[850px] max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-blue-500/20">

        {/* Header - Padding réduit */}
        <DialogHeader className="border-b border-blue-500/20 px-6 py-4 bg-gradient-to-r from-slate-900/80 via-purple-950/30 to-slate-800/80 backdrop-blur-sm flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-base">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/30">
              <Brain className="h-5 w-5 text-purple-300" />
            </div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300 font-semibold">Match Analysis</span>
            <span className="text-blue-300/70 text-sm font-normal ml-auto">
              {game?.awayTeam} @ {game?.homeTeam}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Content - Scroll Natif et Padding réduit (p-4) */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-gradient-to-b from-slate-900/50 to-slate-950/50">
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="space-y-4 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Analyzing forecast...</p>
                </div>
              </div>
            ) : prediction ? (
              <div className="space-y-6">
                {/* ============ SECTION 1: MATCH HEADER (SCOREBOARD) ============ */}
                <Card className={`bg-gradient-to-r ${getWinnerGradient(
                  prediction.predicted_winner
                )} border-blue-500/30 overflow-hidden`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Home Team */}
                      <div className="flex-1 flex flex-col items-center text-center space-y-2">
                        <div className="w-16 h-16 flex items-center justify-center">
                          {game?.homeTeamId && !failedLogos.has(`home-${game.gameId}`) ? (
                            <img
                              src={getLogo(game.homeTeamId)}
                              alt={game?.homeTeam}
                              className="h-16 w-16 object-contain drop-shadow-lg"
                              onError={() => handleLogoError(`home-${game.gameId}`)}
                            />
                          ) : (
                            <div className="text-xl font-bold text-white text-center">
                              {game?.homeTeam}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                            Home
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {game?.homeTeam}
                          </p>
                        </div>
                      </div>

                      {/* Center: Prediction */}
                      <div className="flex-1 flex flex-col items-center justify-center space-y-3 px-4 border-l border-r border-blue-500/20">
                        <div className="text-center space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                            Forecast
                          </p>
                          <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 leading-tight">
                            {prediction.predicted_winner}
                          </p>
                          <p className="text-base font-bold text-amber-400">
                            +{Math.abs(prediction?.predicted_margin || 0).toFixed(1)}
                          </p>
                        </div>

                        {/* Win Probability Bar */}
                        <div className="w-full space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-muted-foreground w-8 truncate">
                              {game?.homeTeam}
                            </span>
                            <Progress
                              value={Math.max(0, prediction?.win_probability_home || 0)}
                              className="flex-1 h-1.5"
                            />
                            <span className="text-[10px] font-bold text-purple-400 w-8 text-right">
                              {Math.max(0, prediction?.win_probability_home || 0).toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-muted-foreground w-8 truncate">
                              {game?.awayTeam}
                            </span>
                            <Progress
                              value={Math.max(0, 100 - (prediction?.win_probability_home || 0))}
                              className="flex-1 h-1.5"
                            />
                            <span className="text-[10px] font-bold text-amber-400 w-8 text-right">
                              {Math.max(0, 100 - (prediction?.win_probability_home || 0)).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 flex flex-col items-center text-center space-y-2">
                        <div className="w-16 h-16 flex items-center justify-center">
                          {game?.awayTeamId && !failedLogos.has(`away-${game.gameId}`) ? (
                            <img
                              src={getLogo(game.awayTeamId)}
                              alt={game?.awayTeam}
                              className="h-16 w-16 object-contain drop-shadow-lg"
                              onError={() => handleLogoError(`away-${game.gameId}`)}
                            />
                          ) : (
                            <div className="text-xl font-bold text-white text-center">
                              {game?.awayTeam}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                            Away
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {game?.awayTeam}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ============ SECTION 2: KEY METRICS ============ */}
                <div className="grid grid-cols-3 gap-3">
                  <Card className="border-purple-500/30 bg-gradient-to-br from-purple-950/40 to-purple-900/20 hover:border-purple-500/50 transition-colors">
                    <CardContent className="p-3">
                      <p className="text-[10px] uppercase tracking-widest text-purple-300/70 font-bold mb-1">
                        Confidence
                      </p>
                      <Badge
                        className={`text-[10px] px-2 py-0.5 ${getConfidenceBadgeColor(
                          getConfidenceLevel(prediction?.predicted_margin || 0)
                        )}`}
                      >
                        {getConfidenceLevel(prediction?.predicted_margin || 0)}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-cyan-900/20 hover:border-cyan-500/50 transition-colors">
                    <CardContent className="p-3">
                      <p className="text-[10px] uppercase tracking-widest text-cyan-300/70 font-bold mb-1">
                        Projected Total
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-cyan-300">
                          {(prediction?.predicted_total_points || 0).toFixed(0)}
                        </span>
                        <span className="text-[10px] text-cyan-400/50">pts</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-amber-500/30 bg-gradient-to-br from-amber-950/40 to-amber-900/20 hover:border-amber-500/50 transition-colors">
                    <CardContent className="p-3">
                      <p className="text-[10px] uppercase tracking-widest text-amber-300/70 font-bold mb-1">
                        Simulation
                      </p>
                      <p className="text-[10px] text-amber-300/80 font-semibold">
                        {homeMissingPlayers.length + awayMissingPlayers.length} absence{homeMissingPlayers.length + awayMissingPlayers.length !== 1 ? "s" : ""}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* ============ SECTION 3: BLOWOUT BAR & SHOOTING BATTLE ============ */}
                {game?.homeTeam && game?.awayTeam && (
                  <BlowoutBar
                    homeTeamName={game.homeTeam}
                    awayTeamName={game.awayTeam}
                    absentHomePlayerIds={homeMissingPlayers.map((p) => p.id)}
                    absentAwayPlayerIds={awayMissingPlayers.map((p) => p.id)}
                  />
                )}

                {homeTeamId && awayTeamId && (
                  <ShootingBattleCard
                    homeTeamCode={homeTeamId}
                    awayTeamCode={awayTeamId}
                    homeMissingPlayers={homeMissingPlayers}
                    awayMissingPlayers={awayMissingPlayers}
                  />
                )}

                {/* ============ SECTION 4: MATH BREAKDOWN ============ */}
                {prediction.math_breakdown && (
                  <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-950/20 to-slate-900/30">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-xs flex items-center gap-2 text-yellow-300">
                        <Zap className="h-3.5 w-3.5 text-yellow-400" />
                        Impact Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="space-y-2">
                        {/* Base Spread */}
                        <div className="grid grid-cols-[1fr_auto_auto] gap-3 p-2 rounded bg-slate-800/50 items-center">
                          <div>
                            <p className="text-[11px] font-semibold text-foreground">Base Spread</p>
                            <p className="text-[9px] text-muted-foreground">
                              {prediction.math_breakdown.base_spread.desc}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[9px] h-4 px-1">
                            Base
                          </Badge>
                          <span
                            className={`font-mono font-bold text-xs ${
                              prediction.math_breakdown.base_spread.value > 0
                                ? "text-purple-400"
                                : "text-amber-400"
                            }`}
                          >
                            {prediction.math_breakdown.base_spread.value > 0 ? "+" : ""}
                            {prediction.math_breakdown.base_spread.value.toFixed(1)}
                          </span>
                        </div>

                        {/* Fatigue Adjustment */}
                        <div className="grid grid-cols-[1fr_auto_auto] gap-3 p-2 rounded bg-slate-800/50 items-center">
                          <div>
                            <p className="text-[11px] font-semibold text-foreground">Fatigue Impact</p>
                            <p className="text-[9px] text-muted-foreground">
                              {prediction.math_breakdown.fatigue_adjust.desc}
                            </p>
                          </div>
                          {Math.abs(prediction.math_breakdown.fatigue_adjust.value) > 0 ? (
                            <Badge className="text-[9px] h-4 px-1 bg-red-500/20 text-red-400 border-red-500/30">
                              Active
                            </Badge>
                          ) : (
                            <span className="text-[9px] text-muted-foreground">-</span>
                          )}
                          <span
                            className={`font-mono font-bold text-xs ${
                              prediction.math_breakdown.fatigue_adjust.value === 0
                                ? "text-muted-foreground"
                                : "text-red-400"
                            }`}
                          >
                            {prediction.math_breakdown.fatigue_adjust.value > 0 ? "+" : ""}
                            {prediction.math_breakdown.fatigue_adjust.value.toFixed(1)}
                          </span>
                        </div>

                        {/* Absences Adjustment */}
                        <div className="grid grid-cols-[1fr_auto_auto] gap-3 p-2 rounded bg-slate-800/50 items-center">
                          <div>
                            <p className="text-[11px] font-semibold text-foreground">
                              Absence Impact
                            </p>
                            <p className="text-[9px] text-muted-foreground">
                              {homeMissingPlayers.length + awayMissingPlayers.length > 0
                                ? `${homeMissingPlayers.length + awayMissingPlayers.length} player(s) absent`
                                : "Full rosters"}
                            </p>
                          </div>
                          {Math.abs(prediction.math_breakdown.absences_adjust.value) > 2 ? (
                            <Badge className="text-[9px] h-4 px-1 bg-orange-500/20 text-orange-400 border-orange-500/30">
                              Major
                            </Badge>
                          ) : (
                            <span className="text-[9px] text-muted-foreground">-</span>
                          )}
                          <span
                            className={`font-mono font-bold text-xs ${
                              prediction.math_breakdown.absences_adjust.value === 0
                                ? "text-muted-foreground"
                                : "text-orange-400"
                            }`}
                          >
                            {prediction.math_breakdown.absences_adjust.value > 0 ? "+" : ""}
                            {prediction.math_breakdown.absences_adjust.value.toFixed(1)}
                          </span>
                        </div>

                        {/* Final Spread */}
                        <div className="grid grid-cols-[1fr_auto_auto] gap-3 p-2 rounded bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 items-center mt-2">
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              Final Projection
                            </p>
                          </div>
                          <div></div>
                          <span
                            className={`font-mono font-black text-sm ${
                              prediction.math_breakdown.final_spread > 0
                                ? "text-purple-400"
                                : "text-amber-400"
                            }`}
                          >
                            {prediction.math_breakdown.final_spread > 0 ? "+" : ""}
                            {prediction.math_breakdown.final_spread.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ============ SECTION 5: CONTEXT & FATIGUE ============ */}
                {prediction.context_analysis && (
                  <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-900/30">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-xs text-emerald-300">Context Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2 p-3 rounded bg-slate-800/50 border border-purple-500/20">
                          {renderFatigueSection(
                            game?.homeTeam,
                            prediction.context_analysis.home_fatigue_factors
                          )}
                        </div>
                        <div className="space-y-2 p-3 rounded bg-slate-800/50 border border-amber-500/20">
                          {renderFatigueSection(
                            game?.awayTeam,
                            prediction.context_analysis.away_fatigue_factors
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ============ SECTION 6: SIMULATION CONTROL ============ */}
                <Card className="border-blue-500/30 bg-gradient-to-br from-blue-950/20 to-slate-900/30">
                  <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="text-xs text-blue-300">Simulation Control</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Home Team Absences */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {game?.homeTeam} Absences
                        </label>
                        <Popover
                          open={homePopoverOpen}
                          onOpenChange={setHomePopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={homePopoverOpen}
                              className="w-full justify-between text-left font-normal h-8 text-xs border-blue-500/30"
                            >
                              <span className="text-muted-foreground truncate">
                                {homeMissingPlayers.length === 0
                                  ? "Add..."
                                  : `${homeMissingPlayers.length} selected`}
                              </span>
                              <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <Input
                                placeholder="Search..."
                                value={homeSearchQuery}
                                onChange={(e) => setHomeSearchQuery(e.target.value)}
                                className="border-0 border-b rounded-none focus-visible:ring-0 text-xs h-8"
                              />
                              <CommandList>
                                <CommandEmpty>No players.</CommandEmpty>
                                <CommandGroup>
                                  {homePlayerSearchResults.map((player) => (
                                    <CommandItem
                                      key={player.id}
                                      value={player.full_name}
                                      onSelect={() => addHomeMissingPlayer(player)}
                                      disabled={
                                        homeMissingPlayers.find(
                                          (p) => p.id === player.id
                                        ) !== undefined
                                      }
                                      className="text-xs"
                                    >
                                      {player.full_name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {homeMissingPlayers.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {homeMissingPlayers.map((player) => (
                              <Badge
                                key={player.id}
                                variant="secondary"
                                className="gap-1 text-[10px] px-1.5 py-0"
                              >
                                {player.full_name.split(' ').pop()}
                                <button
                                  onClick={() =>
                                    removeHomeMissingPlayer(player.id)
                                  }
                                  className="ml-1 hover:text-foreground"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Away Team Absences */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {game?.awayTeam} Absences
                        </label>
                        <Popover
                          open={awayPopoverOpen}
                          onOpenChange={setAwayPopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={awayPopoverOpen}
                              className="w-full justify-between text-left font-normal h-8 text-xs border-blue-500/30"
                            >
                              <span className="text-muted-foreground truncate">
                                {awayMissingPlayers.length === 0
                                  ? "Add..."
                                  : `${awayMissingPlayers.length} selected`}
                              </span>
                              <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <Input
                                placeholder="Search..."
                                value={awaySearchQuery}
                                onChange={(e) => setAwaySearchQuery(e.target.value)}
                                className="border-0 border-b rounded-none focus-visible:ring-0 text-xs h-8"
                              />
                              <CommandList>
                                <CommandEmpty>No players.</CommandEmpty>
                                <CommandGroup>
                                  {awayPlayerSearchResults.map((player) => (
                                    <CommandItem
                                      key={player.id}
                                      value={player.full_name}
                                      onSelect={() =>
                                        addAwayMissingPlayer(player)
                                      }
                                      disabled={
                                        awayMissingPlayers.find(
                                          (p) => p.id === player.id
                                        ) !== undefined
                                      }
                                      className="text-xs"
                                    >
                                      {player.full_name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {awayMissingPlayers.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {awayMissingPlayers.map((player) => (
                              <Badge
                                key={player.id}
                                variant="secondary"
                                className="gap-1 text-[10px] px-1.5 py-0"
                              >
                                {player.full_name.split(' ').pop()}
                                <button
                                  onClick={() =>
                                    removeAwayMissingPlayer(player.id)
                                  }
                                  className="ml-1 hover:text-foreground"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Player Selection Tabs */}
                    <Tabs defaultValue="home" className="w-full mt-2">
                      <TabsList className="grid w-full grid-cols-2 h-7">
                        <TabsTrigger value="home" className="text-[10px] h-full">Home Roster</TabsTrigger>
                        <TabsTrigger value="away" className="text-[10px] h-full">Away Roster</TabsTrigger>
                      </TabsList>

                      <TabsContent value="home" className="mt-2">
                        <div className="grid grid-cols-4 gap-1.5">
                          {homeRoster.slice(0, 12).map((player) => {
                            const isAbsent = homeMissingPlayers.some(
                              (p) => p.id === player.id
                            );
                            return (
                              <Button
                                key={player.id}
                                onClick={() => addHomeMissingPlayer(player)}
                                disabled={isAbsent}
                                variant={isAbsent ? "ghost" : "outline"}
                                size="sm"
                                className={`text-[10px] h-7 px-1 truncate ${
                                  isAbsent
                                    ? "text-muted-foreground opacity-40 line-through cursor-not-allowed"
                                    : "hover:bg-purple-500/20 hover:border-purple-500/50"
                                }`}
                              >
                                {player.full_name.split(' ').pop()}
                              </Button>
                            );
                          })}
                        </div>
                      </TabsContent>

                      <TabsContent value="away" className="mt-2">
                        <div className="grid grid-cols-4 gap-1.5">
                          {awayRoster.slice(0, 12).map((player) => {
                            const isAbsent = awayMissingPlayers.some(
                              (p) => p.id === player.id
                            );
                            return (
                              <Button
                                key={player.id}
                                onClick={() => addAwayMissingPlayer(player)}
                                disabled={isAbsent}
                                variant={isAbsent ? "ghost" : "outline"}
                                size="sm"
                                className={`text-[10px] h-7 px-1 truncate ${
                                  isAbsent
                                    ? "text-muted-foreground opacity-40 line-through cursor-not-allowed"
                                    : "hover:bg-amber-500/20 hover:border-amber-500/50"
                                }`}
                              >
                                {player.full_name.split(' ').pop()}
                              </Button>
                            );
                          })}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Data unavailable
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-blue-500/20 px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 flex gap-3 flex-shrink-0">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="flex-1 border-blue-500/30 hover:bg-blue-500/20 text-blue-300 hover:text-blue-200 font-semibold transition-colors"
            disabled={isSaving}
          >
            <Zap className="h-3.5 w-3.5 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleSaveMatch}
            size="sm"
            disabled={isSaving || !prediction}
            className="flex-1 bg-gradient-to-r from-emerald-600/80 to-green-600/80 hover:from-emerald-500 hover:to-green-500 text-white border-0 font-semibold transition-all"
          >
            <BookmarkCheck className="h-3.5 w-3.5 mr-2" />
            {isSaving ? "Saving..." : "Save Analysis"}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            size="sm"
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500 hover:to-blue-500 text-white font-semibold transition-all"
          >
            Close
            <ChevronRight className="h-3.5 w-3.5 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
