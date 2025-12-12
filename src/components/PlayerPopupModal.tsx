import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { nbaApi } from "@/services/nbaApi";
import { Activity, TrendingUp, Trophy, CalendarDays } from "lucide-react";

interface PlayerPopupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: number;
  playerName: string;
  opponentTeamId: string;
  opponentTeamName: string;
}

export function PlayerPopupModal({
  open,
  onOpenChange,
  playerId,
  playerName,
  opponentTeamId,
  opponentTeamName,
}: PlayerPopupModalProps) {
  
  // Appel à l'API d'analyse
  const { data: popupData, isLoading, error } = useQuery({
    queryKey: ["player-popup", playerId, opponentTeamId],
    queryFn: () => nbaApi.getPlayerPopupData(playerId, opponentTeamId),
    enabled: open && !!playerId && !!opponentTeamId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden bg-background">
        
        {/* EN-TÊTE */}
        <DialogHeader className="p-6 pb-4 border-b bg-muted/20">
          <DialogTitle className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Activity className="h-6 w-6" />
              {playerName}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground font-medium">
              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold">VS</span>
              {opponentTeamName}
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground animate-pulse">Analyse des performances...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-destructive">
            Impossible de charger les données.
          </div>
        ) : popupData ? (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            
            {/* 1. FORME RÉCENTE (Moyennes 6 derniers matchs) */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Forme du Moment (6 derniers matchs)
                </h3>
              </div>
              
              {popupData.recent_form_avg ? (
                <div className="grid grid-cols-4 gap-3">
                  <StatCard label="PTS" value={popupData.recent_form_avg.PTS} color="text-primary" />
                  <StatCard label="REB" value={popupData.recent_form_avg.REB} color="text-blue-600" />
                  <StatCard label="AST" value={popupData.recent_form_avg.AST} color="text-emerald-600" />
                  
                  {/* PRA mis en avant */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-3 rounded-lg border-2 border-purple-500/30 text-center flex flex-col justify-center">
                    <span className="text-xs font-bold text-purple-700 uppercase">PRA</span>
                    <span className="text-2xl font-black text-purple-900">
                      {popupData.recent_form_avg.PRA?.toFixed(1) || "-"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-muted/30 rounded-lg text-sm text-muted-foreground italic">
                  Pas de données récentes disponibles.
                </div>
              )}
            </section>

            {/* 2. FACE-À-FACE (Moyennes vs Adversaire) */}
            <section className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Moyenne vs {opponentTeamName} ({popupData.h2h_avg?.GP || 0} matchs)
                </h3>
              </div>

              {popupData.h2h_avg && popupData.h2h_avg.GP > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  <StatCard label="PTS" value={popupData.h2h_avg.PTS} />
                  <StatCard label="REB" value={popupData.h2h_avg.REB} />
                  <StatCard label="AST" value={popupData.h2h_avg.AST} />
                  
                  {/* PRA en valeur */}
                  <div className="bg-amber-50 rounded-lg border border-amber-200 text-center p-2 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-amber-600">PRA</span>
                    <span className="text-xl font-bold text-amber-800">
                      {popupData.h2h_avg.PRA?.toFixed(1)}
                    </span>
                  </div>

                  {/* Combos */}
                  <MiniStatCard label="Pts+Ast" value={popupData.h2h_avg.PA} />
                  <MiniStatCard label="Pts+Reb" value={popupData.h2h_avg.PR} />
                  <MiniStatCard label="Ast+Reb" value={popupData.h2h_avg.AR} />
                </div>
              ) : (
                <div className="text-center py-4 bg-muted/30 rounded-lg text-sm text-muted-foreground italic">
                  Aucun match récent contre cette équipe.
                </div>
              )}
            </section>

            {/* 3. TENDANCE SAISON */}
            {popupData.season_trend && (
              <section className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Tendance Saison
                  </h3>
                </div>
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">SEUIL (MOYENNE)</p>
                    <p className="text-xl font-bold text-primary">
                      {popupData.season_trend.threshold} pts
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-700 font-bold mb-1">TAUX DE RÉUSSITE</p>
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-3xl font-black text-emerald-600">
                        {popupData.season_trend.hit_rate}%
                      </span>
                      <span className="text-sm text-muted-foreground">des matchs</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// --- Petits composants pour le style (A inclure à la fin du fichier) ---

function StatCard({ label, value, color = "text-foreground" }: { label: string, value: number | undefined, color?: string }) {
  return (
    <div className="bg-muted/30 p-2 rounded-lg border border-border/50 text-center">
      <p className="text-[10px] text-muted-foreground font-semibold uppercase">{label}</p>
      <p className={`text-xl font-bold ${color}`}>
        {value?.toFixed(1) || "-"}
      </p>
    </div>
  );
}

function MiniStatCard({ label, value }: { label: string, value: number | undefined }) {
  return (
    <div className="bg-background border rounded p-2 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground">
        {value?.toFixed(1) || "-"}
      </p>
    </div>
  );
}