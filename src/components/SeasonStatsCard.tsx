import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeasonStats } from "@/services/nbaApi";
import { TrendingUp } from "lucide-react";

interface SeasonStatsCardProps {
  stats: SeasonStats;
}

export function SeasonStatsCard({ stats }: SeasonStatsCardProps) {
  const mainStats = [
    { label: "PTS", value: stats.PTS.toFixed(1), color: "text-primary" },
    { label: "REB", value: stats.REB.toFixed(1), color: "text-nba-blue" },
    { label: "AST", value: stats.AST.toFixed(1), color: "text-accent" },
  ];

  const comboStats = [
    { label: "PRA", value: stats.PRA.toFixed(1), desc: "Points + Rebounds + Assists" },
    { label: "PA", value: stats.PA.toFixed(1), desc: "Points + Assists" },
    { label: "PR", value: stats.PR.toFixed(1), desc: "Points + Rebounds" },
    { label: "AR", value: stats.AR.toFixed(1), desc: "Assists + Rebounds" },
  ];

  const additionalStats = [
    { label: "3PM", value: stats.FG3M.toFixed(1) },
    { label: "STL", value: stats.STL.toFixed(1) },
    { label: "BLK", value: stats.BLK.toFixed(1) },
    { label: "MIN", value: stats.MIN.toFixed(1) },
  ];

  return (
    <div className="space-y-4">
      <Card className="card-gradient border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            Season Averages
          </CardTitle>
          <p className="text-sm text-muted-foreground">{stats.GP} Games Played</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {mainStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className={`text-4xl font-display font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-gradient border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Betting Combo Stats</CardTitle>
          <p className="text-sm text-muted-foreground">Key combinations for prop betting</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {comboStats.map((stat) => (
              <div key={stat.label} className="bg-secondary/50 p-4 rounded-lg">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-display font-bold text-primary">{stat.value}</span>
                  <span className="text-lg font-semibold text-foreground">{stat.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-gradient border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Additional Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {additionalStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
