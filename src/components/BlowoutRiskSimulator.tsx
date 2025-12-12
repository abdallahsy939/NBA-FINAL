import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { nbaApi } from "@/services/nbaApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingUp, ShieldCheck, Skull } from "lucide-react";
import { getTeamCode } from "@/lib/teamMapping";

interface BlowoutSimulatorProps {
  homeTeamName: string;
  awayTeamName: string;
  defaultHomeAbsent?: number[];
  defaultAwayAbsent?: number[];
}

export function BlowoutRiskSimulator({
  homeTeamName,
  awayTeamName,
  defaultHomeAbsent = [],
  defaultAwayAbsent = [],
}: BlowoutSimulatorProps) {
  const homeId = getTeamCode(homeTeamName);
  const awayId = getTeamCode(awayTeamName);

  const [homeAbsent, setHomeAbsent] = useState<number[]>(defaultHomeAbsent);
  const [awayAbsent, setAwayAbsent] = useState<number[]>(defaultAwayAbsent);

  // 1. Fetch Rosters
  const { data: homeRoster } = useQuery({
    queryKey: ["roster", homeId],
    queryFn: () => nbaApi.getTeamRoster(homeId),
    enabled: !!homeId,
  });

  const { data: awayRoster } = useQuery({
    queryKey: ["roster", awayId],
    queryFn: () => nbaApi.getTeamRoster(awayId),
    enabled: !!awayId,
  });

  const relevantHomePlayers = useMemo(() => homeRoster?.slice(0, 8) || [], [homeRoster]);
  const relevantAwayPlayers = useMemo(() => awayRoster?.slice(0, 8) || [], [awayRoster]);

  // 2. Dynamic Prediction
  const { data: prediction, isLoading } = useQuery({
    queryKey: ["sim-blowout", homeId, awayId, homeAbsent, awayAbsent],
    queryFn: () => nbaApi.predictMatch(homeId, awayId, homeAbsent, awayAbsent),
    enabled: !!homeId && !!awayId,
    staleTime: 0,
  });

  const toggleAbsent = (id: number, side: "home" | "away") => {
    if (side === "home") {
      setHomeAbsent((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      );
    } else {
      setAwayAbsent((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      );
    }
  };

  // 3. Visualization Logic
  const margin = prediction ? Math.abs(prediction.predicted_margin) : 0;
  const percentage = Math.min((margin / 25) * 100, 100);

  let statusColor = "bg-green-500";
  let statusText = "Sûr / Jeu Serré";
  let statusIcon = <ShieldCheck className="h-5 w-5 text-green-600" />;

  if (margin >= 10 && margin < 16) {
    statusColor = "bg-yellow-500";
    statusText = "Avantage Clair";
    statusIcon = <TrendingUp className="h-5 w-5 text-yellow-600" />;
  } else if (margin >= 16 && margin < 24) {
    statusColor = "bg-orange-500";
    statusText = "Risque : Blowout (-8% Min)";
    statusIcon = <AlertTriangle className="h-5 w-5 text-orange-600" />;
  } else if (margin >= 24) {
    statusColor = "bg-red-600 animate-pulse";
    statusText = "DANGER EXTRÊME (-15% Min)";
    statusIcon = <Skull className="h-5 w-5 text-red-600" />;
  }

  return (
    <Card className="p-4 border shadow-sm">
      <h3 className="text-sm font-bold uppercase text-muted-foreground mb-4 flex items-center justify-between">
        <span>Impact & Simulateur Blowout</span>
        {isLoading && (
          <span className="text-xs normal-case font-normal animate-pulse">
            Calcul en cours...
          </span>
        )}
      </h3>

      {/* Gauge UI */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-center gap-2">
            {statusIcon}
            <span
              className={`text-sm font-bold ${
                margin >= 16 ? "text-red-600" : "text-foreground"
              }`}
            >
              {statusText}
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black">{margin.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground ml-1">
              écart proj.
            </span>
          </div>
        </div>

        <div className="h-4 w-full bg-secondary rounded-full overflow-hidden relative">
          <div
            className="absolute top-0 bottom-0 left-[40%] w-0.5 bg-white/20 z-10"
            title="10pts Threshold"
          />
          <div
            className="absolute top-0 bottom-0 left-[64%] w-0.5 bg-white/20 z-10"
            title="16pts Threshold (Blowout)"
          />
          <div
            className={`h-full transition-all duration-500 ease-out ${statusColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
          <span>0 pts</span>
          <span>10 pts</span>
          <span className="font-bold text-orange-600">16 pts (Danger)</span>
          <span>25+ pts</span>
        </div>
      </div>

      {/* Rosters Checkboxes UI */}
      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        {/* Home Column */}
        <div>
          <Badge variant="outline" className="mb-2 w-full justify-center bg-muted/50">
            {homeTeamName}
          </Badge>
          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
            {relevantHomePlayers.map((player) => (
              <div key={player.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`home-${player.id}`}
                  checked={homeAbsent.includes(player.id)}
                  onCheckedChange={() => toggleAbsent(player.id, "home")}
                />
                <label
                  htmlFor={`home-${player.id}`}
                  className={`text-xs cursor-pointer select-none truncate ${
                    homeAbsent.includes(player.id)
                      ? "text-muted-foreground line-through"
                      : ""
                  }`}
                >
                  {player.full_name}
                </label>
              </div>
            ))}
            {relevantHomePlayers.length === 0 && (
              <Skeleton className="h-4 w-full" />
            )}
            {relevantHomePlayers.length > 0 && (
              <p className="text-[10px] text-muted-foreground mt-2">Cochez les joueurs absents</p>
            )}
          </div>
        </div>

        {/* Away Column */}
        <div>
          <Badge variant="outline" className="mb-2 w-full justify-center bg-muted/50">
            {awayTeamName}
          </Badge>
          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
            {relevantAwayPlayers.map((player) => (
              <div key={player.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`away-${player.id}`}
                  checked={awayAbsent.includes(player.id)}
                  onCheckedChange={() => toggleAbsent(player.id, "away")}
                />
                <label
                  htmlFor={`away-${player.id}`}
                  className={`text-xs cursor-pointer select-none truncate ${
                    awayAbsent.includes(player.id)
                      ? "text-muted-foreground line-through"
                      : ""
                  }`}
                >
                  {player.full_name}
                </label>
              </div>
            ))}
            {relevantAwayPlayers.length === 0 && (
              <Skeleton className="h-4 w-full" />
            )}
            {relevantAwayPlayers.length > 0 && (
              <p className="text-[10px] text-muted-foreground mt-2">Cochez les joueurs absents</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
