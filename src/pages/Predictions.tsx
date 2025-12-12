import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { nbaApi, MatchHistoryEntry } from "@/services/nbaApi";
import { HistoryDetailsModal } from "@/components/HistoryDetailsModal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, TrendingUp, Home as HomeIcon } from "lucide-react";

const Predictions = () => {
  const [selectedMatch, setSelectedMatch] = useState<MatchHistoryEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: matchHistory = [], isLoading, error } = useQuery({
    queryKey: ["match-history"],
    queryFn: () => nbaApi.getMatchHistory(),
  });

  const handleCardClick = (match: MatchHistoryEntry) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const getLogo = (id: number | undefined) =>
    id ? `https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg` : null;

  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());

  const handleLogoError = (teamId: string) => {
    setFailedLogos((prev) => new Set([...prev, teamId]));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* ============ STICKY HEADER ============ */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-blue-500/20 bg-gradient-to-r from-slate-950/95 to-blue-950/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left: Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative px-3 py-2 bg-slate-950 rounded-lg">
                <TrendingUp className="h-6 w-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 font-display">
                NBA Data AI
              </h1>
              <p className="text-xs text-blue-300/60">Sports Performance Analytics</p>
            </div>
          </div>

          {/* Right: Navigation */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white font-semibold"
            >
              <HomeIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ============ HERO SECTION ============ */}
      <div className="relative pt-28 pb-12 px-4 overflow-hidden">
        {/* Gradient background effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl opacity-50"></div>

        <div className="container mx-auto relative z-10">
          <div className="text-center space-y-6 mb-8">
            {/* Badge */}
            <div className="flex justify-center">
              <Badge className="bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-purple-200 border-purple-500/50 hover:bg-purple-500/40 text-sm px-4 py-1.5 rounded-full">
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                Prediction History & Performance
              </Badge>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200 font-display leading-tight">
                Predictions History
              </h2>
              <p className="text-xl text-blue-200/70 max-w-3xl mx-auto">
                Review past predictions and accuracy metrics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <main className="relative z-10 container mx-auto px-4 pb-20">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="space-y-4 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading prediction history...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20 text-red-400">
            <p className="text-sm">Failed to load prediction history</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && matchHistory.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg mb-4">No predictions saved yet</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500 hover:to-blue-500 text-white font-semibold transition-all"
            >
              Go to Predictions
            </Link>
          </div>
        )}

        {/* Predictions Grid */}
        {!isLoading && !error && matchHistory.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-white mb-6">Saved Predictions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchHistory.map((match) => (
                <Card
                  key={match.game_id}
                  onClick={() => handleCardClick(match)}
                  className="border-blue-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-blue-500/60 hover:from-slate-800 hover:to-slate-900 transition-all cursor-pointer group overflow-hidden"
                >
                  <CardContent className="p-0">
                    {/* Card Header with Teams */}
                    <div className="p-4 border-b border-blue-500/20">
                      <div className="flex items-center justify-between gap-2">
                        {/* Home Team */}
                        <div className="flex-1 flex flex-col items-center text-center space-y-2">
                          <div className="w-12 h-12 flex items-center justify-center">
                            {match.home_team_id &&
                            !failedLogos.has(`home-${match.game_id}`) ? (
                              <img
                                src={getLogo(match.home_team_id)}
                                alt={match.home_team}
                                className="h-12 w-12 object-contain drop-shadow-lg group-hover:scale-110 transition-transform"
                                onError={() => handleLogoError(`home-${match.game_id}`)}
                              />
                            ) : (
                              <div className="text-xs font-bold text-white text-center">
                                {match.home_team.substring(0, 3).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold truncate">
                            {match.home_team}
                          </p>
                        </div>

                        {/* VS */}
                        <div className="px-2 text-center">
                          <p className="text-[10px] text-slate-400 font-semibold">VS</p>
                        </div>

                        {/* Away Team */}
                        <div className="flex-1 flex flex-col items-center text-center space-y-2">
                          <div className="w-12 h-12 flex items-center justify-center">
                            {match.away_team_id &&
                            !failedLogos.has(`away-${match.game_id}`) ? (
                              <img
                                src={getLogo(match.away_team_id)}
                                alt={match.away_team}
                                className="h-12 w-12 object-contain drop-shadow-lg group-hover:scale-110 transition-transform"
                                onError={() => handleLogoError(`away-${match.game_id}`)}
                              />
                            ) : (
                              <div className="text-xs font-bold text-white text-center">
                                {match.away_team.substring(0, 3).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold truncate">
                            {match.away_team}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Body - Match Details */}
                    <div className="p-4 space-y-3">
                      {/* Date */}
                      <div className="text-center">
                        <p className="text-xs text-slate-400 mb-1">
                          {new Date(match.game_date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      {/* Status & Accuracy Badge */}
                      <div className="flex flex-col gap-2">
                        {match.status === "FINISHED" && match.accuracy_score !== undefined ? (
                          <Badge className="w-full justify-center bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30">
                            <span className="text-lg mr-2">🎯</span>
                            {match.accuracy_score.toFixed(0)}% Correct
                          </Badge>
                        ) : match.status === "FINISHED" && match.real_winner ? (
                          <Badge className="w-full justify-center bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/30">
                            <span className="text-lg mr-2">✓</span>
                            {match.real_winner} Won
                          </Badge>
                        ) : (
                          <Badge className="w-full justify-center bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30">
                            <span className="text-lg mr-2">⏱</span>
                            Game Pending
                          </Badge>
                        )}
                      </div>

                      {/* Saved Date */}
                      <p className="text-[10px] text-slate-500 text-center">
                        Saved: {new Date(match.saved_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-10 border-t border-blue-500/20 mt-20 bg-gradient-to-t from-slate-950 to-transparent">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-blue-300/40">
          <p>NBA Data AI • Advanced Performance Insights & Predictions</p>
          <p className="mt-2 text-xs text-blue-400/30">
            Data from NBA Stats API • AI-Powered Analysis
          </p>
        </div>
      </footer>

      {/* History Details Modal */}
      <HistoryDetailsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        match={selectedMatch}
      />
    </div>
  );
};

export default Predictions;
