import { useQuery } from "@tanstack/react-query";
import { nbaApi } from "@/services/nbaApi";
import { Card } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, ShieldCheck, Skull } from "lucide-react";
import { getTeamCode } from "@/lib/teamMapping";

interface BlowoutBarProps {
  homeTeamName: string;
  awayTeamName: string;
  absentHomePlayerIds?: number[];
  absentAwayPlayerIds?: number[];
}

export function BlowoutBar({
  homeTeamName,
  awayTeamName,
  absentHomePlayerIds = [],
  absentAwayPlayerIds = [],
}: BlowoutBarProps) {
  const homeId = getTeamCode(homeTeamName);
  const awayId = getTeamCode(awayTeamName);

  const { data: prediction, isLoading } = useQuery({
    queryKey: ["sim-blowout", homeId, awayId, absentHomePlayerIds, absentAwayPlayerIds],
    queryFn: () => nbaApi.predictMatch(homeId, awayId, absentHomePlayerIds, absentAwayPlayerIds),
    enabled: !!homeId && !!awayId,
    staleTime: 0,
  });

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
        <span>Risque de Blowout</span>
        {isLoading && (
          <span className="text-xs normal-case font-normal animate-pulse">
            Calcul en cours...
          </span>
        )}
      </h3>

      <div className="space-y-3">
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
    </Card>
  );
}
