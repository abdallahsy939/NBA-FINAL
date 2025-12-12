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

interface PlayerRowProps {
  player: PlayerHistoryEntry;
  isFinished: boolean;
}

function PlayerRow({ player, isFinished }: PlayerRowProps) {
  const projPts = player.predicted_stats?.PTS || 0;
  const realPts = player.real_stats?.PTS;
  const diff = realPts !== undefined ? realPts - projPts : null;

  const getVerdictColor = (difference: number | null) => {
    if (difference === null) return "";
    if (Math.abs(difference) < 3) return "text-emerald-400";
    return "text-red-400";
  };

  const getVerdictIcon = (difference: number | null) => {
    if (difference === null) return null;
    if (Math.abs(difference) < 3) return <CheckCircle className="h-5 w-5" />;
    return <AlertCircle className="h-5 w-5" />;
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 transition-colors">
      {/* Identity Column */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-10 w-10 border border-blue-500/30 flex-shrink-0">
          <AvatarImage src={getPlayerAvatar(player.player_id)} alt={player.name} />
          <AvatarFallback className="bg-slate-700 text-xs font-bold text-white">
            {player.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{player.name}</p>
          <p className="text-xs text-slate-400">{player.team}</p>
        </div>
      </div>

      {/* Projected Column */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0 px-4 text-center">
        <p className="text-xs text-slate-400 font-semibold uppercase">Proj</p>
        <p className="text-lg font-bold text-cyan-400">{projPts.toFixed(1)}</p>
      </div>

      {/* Reality Column */}
      {isFinished ? (
        <div className="flex flex-col items-center gap-1 flex-shrink-0 px-4 text-center">
          <p className="text-xs text-slate-400 font-semibold uppercase">Real</p>
          <p className="text-lg font-bold text-amber-400">
            {realPts !== undefined ? realPts.toFixed(0) : "-"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 flex-shrink-0 px-4 text-center">
          <p className="text-xs text-slate-400 font-semibold uppercase">Real</p>
          <p className="text-xs text-slate-500">-</p>
        </div>
      )}

      {/* Verdict Column */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0 px-4 text-center">
        <p className="text-xs text-slate-400 font-semibold uppercase">Verdict</p>
        {isFinished ? (
          diff !== null ? (
            <div className={`flex items-center gap-2 ${getVerdictColor(diff)}`}>
              {getVerdictIcon(diff)}
              <span className="text-xs font-bold">
                {diff > 0 ? "+" : ""}{diff.toFixed(1)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-500">-</span>
          )
        ) : (
          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Waiting...</span>
          </div>
        )}
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-blue-500/20">
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
