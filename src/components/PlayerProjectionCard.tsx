import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { nbaApi, Player, PlayerProjection } from "@/services/nbaApi";
import { Brain, TrendingUp } from "lucide-react";

interface PlayerProjectionCardProps {
  player: Player;
  opponentTeamCode: string;
  opponentTeamName: string;
}

export function PlayerProjectionCard({
  player,
  opponentTeamCode,
  opponentTeamName,
}: PlayerProjectionCardProps) {
  const { data: projection, isLoading, error } = useQuery({
    queryKey: ["player-projection", player.id, opponentTeamCode],
    queryFn: () => nbaApi.predictPlayerStats(player.id, opponentTeamCode),
    enabled: !!opponentTeamCode,
  });

  if (!opponentTeamCode) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="border-purple-500/30 bg-gradient-to-br from-purple-600/5 to-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            🔮 Projection IA ce soir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 dark:border-purple-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !projection) {
    return (
      <Card className="border-purple-500/30 bg-gradient-to-br from-purple-600/5 to-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            🔮 Projection IA ce soir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center text-sm">
            Impossible de charger la projection. Veuillez réessayer.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getDifferenceColor = (projected: number, actual: number) => {
    const diff = projected - actual;
    if (diff > 0) return "text-emerald-600 dark:text-emerald-400";
    if (diff < 0) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  const getDifferenceSign = (projected: number, actual: number) => {
    const diff = projected - actual;
    if (diff > 0) return "+";
    if (diff < 0) return "";
    return "±";
  };

  return (
    <Card className="border-purple-500/30 bg-gradient-to-br from-purple-600/5 to-amber-500/5 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          🔮 Projection IA ce soir
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-2">
          Basé sur le Pace (Rythme) et la Défense de <span className="font-semibold">{opponentTeamName}</span>
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {/* Points */}
          <div className="space-y-2">
            <div className="text-center">
              <p className="text-xs font-semibold text-muted-foreground mb-2">POINTS (PTS)</p>
              <div className="space-y-1">
                {/* Projected */}
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-600/10 p-3 rounded-lg border border-purple-500/20">
                  <p className="text-2xl font-display font-bold text-purple-600 dark:text-purple-400">
                    {projection.projected_pts.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Projeté</p>
                </div>
                {/* Actual */}
                <div className="bg-secondary/50 p-2 rounded-lg border border-border">
                  <p className="text-sm font-semibold text-foreground">
                    {projection.season_avg_pts.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Moyenne saison</p>
                </div>
                {/* Difference */}
                <div className={`text-xs font-bold ${getDifferenceColor(projection.projected_pts, projection.season_avg_pts)}`}>
                  {getDifferenceSign(projection.projected_pts, projection.season_avg_pts)}
                  {Math.abs(projection.projected_pts - projection.season_avg_pts).toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Rebounds */}
          <div className="space-y-2">
            <div className="text-center">
              <p className="text-xs font-semibold text-muted-foreground mb-2">REBONDS (REB)</p>
              <div className="space-y-1">
                {/* Projected */}
                <div className="bg-gradient-to-br from-amber-600/20 to-amber-600/10 p-3 rounded-lg border border-amber-500/20">
                  <p className="text-2xl font-display font-bold text-amber-600 dark:text-amber-400">
                    {projection.projected_reb.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Projeté</p>
                </div>
                {/* Actual */}
                <div className="bg-secondary/50 p-2 rounded-lg border border-border">
                  <p className="text-sm font-semibold text-foreground">
                    {projection.season_avg_reb.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Moyenne saison</p>
                </div>
                {/* Difference */}
                <div className={`text-xs font-bold ${getDifferenceColor(projection.projected_reb, projection.season_avg_reb)}`}>
                  {getDifferenceSign(projection.projected_reb, projection.season_avg_reb)}
                  {Math.abs(projection.projected_reb - projection.season_avg_reb).toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Assists */}
          <div className="space-y-2">
            <div className="text-center">
              <p className="text-xs font-semibold text-muted-foreground mb-2">PASSES (AST)</p>
              <div className="space-y-1">
                {/* Projected */}
                <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-600/10 p-3 rounded-lg border border-indigo-500/20">
                  <p className="text-2xl font-display font-bold text-indigo-600 dark:text-indigo-400">
                    {projection.projected_ast.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Projeté</p>
                </div>
                {/* Actual */}
                <div className="bg-secondary/50 p-2 rounded-lg border border-border">
                  <p className="text-sm font-semibold text-foreground">
                    {projection.season_avg_ast.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Moyenne saison</p>
                </div>
                {/* Difference */}
                <div className={`text-xs font-bold ${getDifferenceColor(projection.projected_ast, projection.season_avg_ast)}`}>
                  {getDifferenceSign(projection.projected_ast, projection.season_avg_ast)}
                  {Math.abs(projection.projected_ast - projection.season_avg_ast).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with AI factors */}
        <div className="mt-4 pt-4 border-t border-purple-500/20">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-secondary/30 p-2 rounded">
              <p className="text-muted-foreground">Pace Prévu</p>
              <p className="font-bold text-foreground">{projection.pace.toFixed(1)}</p>
            </div>
            <div className="bg-secondary/30 p-2 rounded">
              <p className="text-muted-foreground">Défense Adverse</p>
              <p className="font-bold text-foreground">{projection.opponent_defense_rating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
