import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AlertCircle, CheckCircle, Clock, X, ChevronRight } from "lucide-react";
import { MatchHistoryEntry, PlayerHistoryEntry } from "@/services/nbaApi";

interface HistoryDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: MatchHistoryEntry | null;
}

const getLogo = (id: number | undefined) =>
  id ? `https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg` : null;

const getPlayerAvatar = (playerId: number) =>
  `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`;

interface StatComparison {
  PTS: number;
  REB: number;
  AST: number;
  PRA: number;
}

function calculateStats(stats: { PTS: number; REB: number; AST: number }): StatComparison {
  return {
    PTS: stats.PTS,
    REB: stats.REB,
    AST: stats.AST,
    PRA: stats.PTS + stats.REB + stats.AST,
  };
}

interface StatCellProps {
  stat: string;
  projected: number;
  real: number | null;
  isFinished: boolean;
}

function getStatColor(stat: string) {
  switch (stat) {
    case "PTS":
      return { bg: "bg-amber-950/40", text: "text-amber-400", border: "border-amber-500/30", label: "text-amber-300" };
    case "REB":
      return { bg: "bg-emerald-950/40", text: "text-emerald-400", border: "border-emerald-500/30", label: "text-emerald-300" };
    case "AST":
      return { bg: "bg-cyan-950/40", text: "text-cyan-400", border: "border-cyan-500/30", label: "text-cyan-300" };
    case "PRA":
      return { bg: "bg-purple-950/40", text: "text-purple-400", border: "border-purple-500/30", label: "text-purple-300" };
    default:
      return { bg: "bg-blue-950/40", text: "text-blue-400", border: "border-blue-500/30", label: "text-blue-300" };
  }
}

function StatCell({ stat, projected, real, isFinished }: StatCellProps) {
  const displayReal = real !== null && real !== undefined;
  const isPending = !isFinished || real === null || real === undefined;
  const statColor = getStatColor(stat);

  let realColor = "";
  let backgroundColor = statColor.bg;

  if (displayReal && !isPending) {
    const diff = real - projected;
    if (diff > 0) {
      realColor = "text-emerald-300"; // Over hit - Green
      backgroundColor = "bg-emerald-950/50 border border-emerald-500/40";
    } else if (diff < 0) {
      realColor = "text-red-300"; // Under hit - Red
      backgroundColor = "bg-red-950/50 border border-red-500/40";
    } else {
      realColor = "text-yellow-300"; // Perfect match
      backgroundColor = "bg-yellow-950/50 border border-yellow-500/40";
    }
  } else if (!isPending) {
    backgroundColor = `${statColor.bg} border ${statColor.border}`;
  }

  return (
    <div className={`flex flex-col items-center gap-1 p-2 rounded-lg ${backgroundColor}`}>
      <p className={`text-[10px] font-semibold uppercase ${statColor.label} tracking-wider`}>
        {stat}
      </p>
      <div className="flex flex-col items-center gap-0.5 w-full">
        <p className={`text-xs ${statColor.text} font-medium`}>
          {projected.toFixed(stat === "PTS" || stat === "PRA" ? 1 : 1)}
        </p>
        {isFinished ? (
          <p className={`text-sm font-bold ${realColor}`}>
            {displayReal ? real.toFixed(0) : "-"}
          </p>
        ) : (
          <p className="text-xs text-slate-500">-</p>
        )}
      </div>
    </div>
  );
}

interface PlayerRowProps {
  player: PlayerHistoryEntry;
  isFinished: boolean;
}

function PlayerRow({ player, isFinished }: PlayerRowProps) {
  const projStats = calculateStats(player.predicted_stats);
  const realStats = player.real_stats
    ? calculateStats(player.real_stats)
    : null;

  const isPending = !isFinished || !realStats;

  return (
    <div className="flex flex-col rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 transition-colors overflow-hidden">
      {/* Player Identity Row */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/30">
        <Avatar className="h-10 w-10 border border-blue-500/30 flex-shrink-0">
          <AvatarImage src={getPlayerAvatar(player.player_id)} alt={player.name} />
          <AvatarFallback className="bg-slate-700 text-xs font-bold text-white">
            {player.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{player.name}</p>
          <p className="text-xs text-slate-400">{player.team}</p>
        </div>
        {isPending && (
          <div className="flex items-center gap-1 text-slate-500 flex-shrink-0">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Pending</span>
          </div>
        )}
      </div>

      {/* Stats Grid Row */}
      <div className="grid grid-cols-4 gap-2 p-4 bg-slate-800/30">
        {/* PTS Column */}
        <div>
          <div className="text-[10px] font-bold uppercase text-amber-400 mb-2 text-center tracking-wider bg-amber-950/30 py-1.5 rounded-md border border-amber-500/20">
            🏀 PTS
          </div>
          <StatCell
            stat="PTS"
            projected={projStats.PTS}
            real={realStats?.PTS ?? null}
            isFinished={isFinished}
          />
          {isFinished && (
            <div className="text-center mt-1">
              <p className="text-[10px] text-slate-400">Real</p>
              <p className={`text-xs font-bold ${
                realStats && realStats.PTS > projStats.PTS ? "text-emerald-400" :
                realStats && realStats.PTS < projStats.PTS ? "text-red-400" :
                "text-amber-300"
              }`}>
                {realStats ? realStats.PTS.toFixed(0) : "-"}
              </p>
            </div>
          )}
        </div>

        {/* REB Column */}
        <div>
          <div className="text-[10px] font-bold uppercase text-emerald-400 mb-2 text-center tracking-wider bg-emerald-950/30 py-1.5 rounded-md border border-emerald-500/20">
            📦 REB
          </div>
          <StatCell
            stat="REB"
            projected={projStats.REB}
            real={realStats?.REB ?? null}
            isFinished={isFinished}
          />
          {isFinished && (
            <div className="text-center mt-1">
              <p className="text-[10px] text-slate-400">Real</p>
              <p className={`text-xs font-bold ${
                realStats && realStats.REB > projStats.REB ? "text-emerald-400" :
                realStats && realStats.REB < projStats.REB ? "text-red-400" :
                "text-emerald-300"
              }`}>
                {realStats ? realStats.REB.toFixed(0) : "-"}
              </p>
            </div>
          )}
        </div>

        {/* AST Column */}
        <div>
          <div className="text-[10px] font-bold uppercase text-cyan-400 mb-2 text-center tracking-wider bg-cyan-950/30 py-1.5 rounded-md border border-cyan-500/20">
            🎯 AST
          </div>
          <StatCell
            stat="AST"
            projected={projStats.AST}
            real={realStats?.AST ?? null}
            isFinished={isFinished}
          />
          {isFinished && (
            <div className="text-center mt-1">
              <p className="text-[10px] text-slate-400">Real</p>
              <p className={`text-xs font-bold ${
                realStats && realStats.AST > projStats.AST ? "text-emerald-400" :
                realStats && realStats.AST < projStats.AST ? "text-red-400" :
                "text-cyan-300"
              }`}>
                {realStats ? realStats.AST.toFixed(0) : "-"}
              </p>
            </div>
          )}
        </div>

        {/* PRA Column */}
        <div>
          <div className="text-[10px] font-bold uppercase text-purple-400 mb-2 text-center tracking-wider bg-purple-950/30 py-1.5 rounded-md border border-purple-500/20">
            ✨ PRA
          </div>
          <StatCell
            stat="PRA"
            projected={projStats.PRA}
            real={realStats?.PRA ?? null}
            isFinished={isFinished}
          />
          {isFinished && (
            <div className="text-center mt-1">
              <p className="text-[10px] text-slate-400">Real</p>
              <p className={`text-xs font-bold ${
                realStats && realStats.PRA > projStats.PRA ? "text-emerald-400" :
                realStats && realStats.PRA < projStats.PRA ? "text-red-400" :
                "text-purple-300"
              }`}>
                {realStats ? realStats.PRA.toFixed(0) : "-"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function HistoryDetailsModal({
  open,
  onOpenChange,
  match,
}: HistoryDetailsModalProps) {
  if (!match) return null;

  const isFinished = match.status === "FINISHED";
  const failedLogos = new Set<string>();

  const handleLogoError = (teamId: string) => {
    failedLogos.add(teamId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-blue-500/20">
        {/* Header */}
        <DialogHeader className="border-b border-blue-500/20 px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="flex items-center gap-3 text-base">
              <span className="text-foreground">Match History</span>
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-background/50">
          <div className="p-6 space-y-6">
            {/* Match Header */}
            <div className="space-y-4">
              <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-blue-500/30 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-8">
                    {/* Home Team */}
                    <div className="flex-1 flex flex-col items-center text-center space-y-3">
                      <div className="w-20 h-20 flex items-center justify-center">
                        {match.home_team_id && !failedLogos.has(`home-${match.game_id}`) ? (
                          <img
                            src={getLogo(match.home_team_id)}
                            alt={match.home_team}
                            className="h-20 w-20 object-contain drop-shadow-lg"
                            onError={() => handleLogoError(`home-${match.game_id}`)}
                          />
                        ) : (
                          <div className="text-lg font-bold text-white text-center">
                            {match.home_team}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                          Home
                        </p>
                        <p className="text-sm font-bold text-foreground">{match.home_team}</p>
                      </div>
                    </div>

                    {/* Center: VS and Date */}
                    <div className="flex flex-col items-center justify-center space-y-3 px-4 border-l border-r border-blue-500/20">
                      <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                        VS
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(match.game_date).toLocaleDateString()}
                      </p>
                      {isFinished && match.real_winner && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <CheckCircle className="h-3 w-3 mr-1.5" />
                          {match.real_winner}
                        </Badge>
                      )}
                      {!isFinished && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                          <Clock className="h-3 w-3 mr-1.5" />
                          Pending
                        </Badge>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 flex flex-col items-center text-center space-y-3">
                      <div className="w-20 h-20 flex items-center justify-center">
                        {match.away_team_id && !failedLogos.has(`away-${match.game_id}`) ? (
                          <img
                            src={getLogo(match.away_team_id)}
                            alt={match.away_team}
                            className="h-20 w-20 object-contain drop-shadow-lg"
                            onError={() => handleLogoError(`away-${match.game_id}`)}
                          />
                        ) : (
                          <div className="text-lg font-bold text-white text-center">
                            {match.away_team}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                          Away
                        </p>
                        <p className="text-sm font-bold text-foreground">{match.away_team}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accuracy Score (if finished) */}
              {isFinished && match.accuracy_score !== undefined && (
                <Card className="border-blue-500/20 bg-blue-950/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                          Accuracy Score
                        </p>
                        <p className="text-sm text-slate-300 mt-1">
                          Overall prediction performance for this match
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-cyan-400">
                          {match.accuracy_score.toFixed(0)}%
                        </span>
                        <span className="text-2xl">🎯</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Home Players */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {match.home_team} Players
              </h3>
              <div className="space-y-2">
                {match.home_players.map((player) => (
                  <PlayerRow
                    key={player.player_id}
                    player={player}
                    isFinished={isFinished}
                  />
                ))}
              </div>
            </div>

            {/* Away Players */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {match.away_team} Players
              </h3>
              <div className="space-y-2">
                {match.away_players.map((player) => (
                  <PlayerRow
                    key={player.player_id}
                    player={player}
                    isFinished={isFinished}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-blue-500/20 px-6 py-4 bg-slate-900 flex-shrink-0">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500 hover:to-blue-500 text-white font-semibold transition-all"
          >
            Close
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
