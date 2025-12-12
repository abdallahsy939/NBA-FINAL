import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameLog } from "@/services/nbaApi";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameLogsTableProps {
  gameLogs: GameLog[];
}

export function GameLogsTable({ gameLogs }: GameLogsTableProps) {
  return (
    <Card className="card-gradient border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calendar className="h-5 w-5 text-primary" />
          Recent Game Logs
        </CardTitle>
        <p className="text-sm text-muted-foreground">Last {gameLogs.length} games</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Date</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Matchup</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground">W/L</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground">PTS</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground">REB</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground">AST</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground">MIN</th>
              </tr>
            </thead>
            <tbody>
              {gameLogs.map((log, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-2 text-sm text-foreground">{log.GAME_DATE}</td>
                  <td className="py-3 px-2 text-sm font-medium text-foreground">{log.MATCHUP}</td>
                  <td className="text-center py-3 px-2">
                    <span
                      className={cn(
                        "inline-block px-2 py-1 rounded text-xs font-bold",
                        log.WL === "W" ? "bg-win/20 text-win" : "bg-loss/20 text-loss"
                      )}
                    >
                      {log.WL}
                    </span>
                  </td>
                  <td className="text-center py-3 px-2 text-sm font-semibold text-primary">{log.PTS}</td>
                  <td className="text-center py-3 px-2 text-sm font-semibold text-nba-blue">{log.REB}</td>
                  <td className="text-center py-3 px-2 text-sm font-semibold text-accent">{log.AST}</td>
                  <td className="text-center py-3 px-2 text-sm text-muted-foreground">
                    {log.MIN ? log.MIN.toFixed(0) : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
