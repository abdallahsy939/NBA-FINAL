const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export interface Player {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  team?: string;
}

export interface SeasonStats {
  PLAYER_ID: number;
  GP: number;
  MIN: number;
  PTS: number;
  AST: number;
  REB: number;
  STL: number;
  BLK: number;
  FG3M: number;
  PRA: number;
  PA: number;
  PR: number;
  AR: number;
}

export interface GameLog {
  GAME_DATE: string;
  MATCHUP: string;
  WL: string;
  PTS: number;
  REB: number;
  AST: number;
  PRA: number;
  PA: number;
  PR: number;
}

export interface TrendResult {
  current_active_streak: number;
  total_hits: number;
  hit_rate_percent: number;
  message: string;
}

export interface TodayGame {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  // Correction : Accepter string ou number
  homeTeamId?: string | number;
  awayTeamId?: string | number;
  time: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  gameDate: string;
  isLive: boolean;
}

// Nouvelle interface pour la réponse globale
export interface GamesResponse {
  success: boolean;
  method: string;
  total_games: number;
  games: TodayGame[];
}

export interface VsTeamStats {
  GP: number;
  PTS: number;
  AST: number;
  REB: number;
  PRA: number;
  PA: number;
  PR: number;
  AR: number;
  STL: number;
  BLK: number;
  OPPONENT?: string;
}

export interface AbsencesImpact {
  home_total_penalty: number;
  away_total_penalty: number;
}

export interface ContextAnalysis {
  home_fatigue_penalty: number;
  home_fatigue_factors: string[];
  away_fatigue_penalty: number;
  away_fatigue_factors: string[];
}

export interface MatchPrediction {
  predicted_winner: string;
  predicted_margin: number;
  win_probability_home: number;
  predicted_total_points: number;
  confidence_level?: string;

  math_breakdown: {
    base_spread: { value: number; desc: string };
    fatigue_adjust: { value: number; desc: string };
    absences_adjust: { value: number; desc: string };
    final_spread: number;
  };

  context_analysis: {
    home_fatigue_factors: string[];
    away_fatigue_factors: string[];
  };

  details: {
    spread_raw: number;
    home_net_rtg?: number;
    away_net_rtg?: number;
  };
}

export interface MatchPredictionV2Response {
  match_info: {
    predicted_winner: string;
    predicted_spread: number;
    predicted_total_points: number;
    home_score: number;
    away_score: number;
    win_probability_home: number;
  };
  home_players: PlayerFullPrediction[];
  away_players: PlayerFullPrediction[];
  context_analysis: {
    home_fatigue_factors: string[];
    away_fatigue_factors: string[];
  };
}

export interface PlayerProjection {
  player_id: number;
  player_name: string;
  opponent_team: string;
  projected_pts: number;
  projected_reb: number;
  projected_ast: number;
  season_avg_pts: number;
  season_avg_reb: number;
  season_avg_ast: number;
  pace: number;
  opponent_defense_rating: number;
}

export interface PlayerStats {
  games: number;
  win_percentage: number;
  ppg: number;
  status: string;
}

export interface MissingPlayerAnalysis {
  player_id: number;
  player_name: string;
  team: string;
  stats_with: PlayerStats;
  stats_without: PlayerStats;
}

export interface PlayerPredictedStats {
  PTS: number;
  REB: number;
  AST: number;
  MIN: number;
  FG3M: number;
  STL?: number;
  BLK?: number;
  PTS_RANGE?: string;
}

export interface AdvancedMetricsProjected {
  PRA: number;
}

export interface BlowoutAnalysis {
  risk_level: "LOW" | "HIGH" | "MEDIUM";
  message?: string;
  margin?: number;
}

export interface MatchupAnalysis {
  paint_vulnerability?: number;
  [key: string]: any;
}

export interface PlayerContext {
  boost_applied: string;
  blowout_penalty?: string;
  form_weight?: string;
  reasoning?: string;
}

export interface Archetype {
  type: string;
  is_star: boolean;
  paint_rate: number;
  three_rate: number;
}

export interface PlayerFullPrediction {
  player: string;
  position?: string;
  player_id: number;
  team: string;
  predicted_stats: PlayerPredictedStats;
  advanced_metrics_projected: AdvancedMetricsProjected;
  archetype?: Archetype;
  matchup_analysis?: {
    defensive_rating?: number;
    rank?: number;
    description?: string;
    factor_applied?: number;
  };
  context?: PlayerContext;
  blowout_analysis: BlowoutAnalysis;
  is_home?: boolean;
  shot_quality_analysis?: {
    tier: string;
    reasoning: string;
    pts_before: number;
    pts_after: number;
  };
  lineup_synergy?: {
    multiplier: number;
    impact_pct: number;
  };
}

export interface MatchContext {
  home_usage_boost: number;
  away_usage_boost: number;
  home_absent_count?: number;
  away_absent_count?: number;
  status?: string;
}

export interface FullMatchPrediction {
  home_players: PlayerFullPrediction[];
  away_players: PlayerFullPrediction[];
  blowout_analysis?: {
    risk_level: "LOW" | "HIGH" | "MEDIUM";
  };
}

export interface InteractiveMatchPrediction {
  match_context: MatchContext;
  home_players: PlayerFullPrediction[];
  away_players: PlayerFullPrediction[];
}

export interface RecentFormAvg {
  PTS: number;
  REB: number;
  AST: number;
  PRA: number;
  STL?: number;
  BLK?: number;
  PA?: number; 
  PR?: number;
  MIN?: number;
  GP?: number;
  [key: string]: number | undefined;
}

export interface H2HAvg {
  GP: number;
  PTS: number;
  REB: number;
  AST: number;
  STL?: number;
  BLK?: number;
  PRA: number;
  PR: number;
  PA: number;
  AR: number;
  [key: string]: number | undefined | string;
}

export interface SeasonTrend {
  threshold: number;
  hit_rate: number;
  message: string;
}

export interface PlayerDetailsHistory {
  recent_form_avg: RecentFormAvg;
  h2h_avg: H2HAvg;
  season_trend?: SeasonTrend;
  splits?: Splits;
  fatigue?: Fatigue;
  matchup_context?: string;
  recent_form?: any[];
  h2h_history?: any[];
}

export interface PlayerPopupData {
  recent_form_avg: RecentFormAvg;
  h2h_avg: H2HAvg;
  season_trend: SeasonTrend;
}

export interface StatLine {
  PTS?: number;
  REB?: number;
  AST?: number;
  GP?: number;
}

export interface Splits {
  home: StatLine | null;
  away: StatLine | null;
}

export interface Fatigue {
  last_min: number;
  days_rest: number;
  status: string;
  color_code: "green" | "red" | "gray";
}

export interface CalculatorResult {
  stat: string;
  line: number;
  projection: number;
  std_dev_calculated: number;
  probability_over: number;
  probability_under: number;
  advice: string;
  color_code: string;
  confidence: string;
  probability?: number;
  recommendation?: string;
}

export interface ShootingStats {
  team: string;
  FG2M: number;
  FG2M_Range: string;
  FG3M: number;
  FG3M_Range: string;
  Total_FG: number;
}

export interface ShootingPrediction {
  matchup: string;
  pace_context: string;
  home: ShootingStats;
  away: ShootingStats;
  analysis: {
    "3pt_winner": string;
    "2pt_winner": string;
    "fatigue_impact": string;
  };
}

export interface ShootingBattleData {
  matchup: string;
  pace_context: string;
  home: {
    team: string;
    FG2M: number;
    FG2M_Range: string;
    FG3M: number;
    FG3M_Range: string;
    Total_FG: number;
  };
  away: {
    team: string;
    FG2M: number;
    FG2M_Range: string;
    FG3M: number;
    FG3M_Range: string;
    Total_FG: number;
  };
  analysis: {
    "3pt_winner": string;
    "2pt_winner": string;
    "fatigue_impact": string;
  };
}

export interface PredictionPayload {
  player_id: number;
  player_name: string;
  opponent_id: string;
  game_date: string;
  predicted_stats: {
    [key: string]: number;
  };
  context: string;
}

export interface PredictionRecord {
  id?: number;
  player_id: number;
  player_name: string;
  opponent_id: string;
  game_date: string;
  predicted_stats: {
    [key: string]: number;
  };
  context: string;
  created_at?: string;
  actual_stats?: {
    [key: string]: number;
  };
  status: "pending" | "completed";
}

export interface PlayerStatSave {
  player_id: number;
  name: string;
  team: string;
  predicted_stats: {
    PTS: number;
    REB: number;
    AST: number;
    MIN: number;
    PRA: number;
  };
}

export interface MatchSaveRequest {
  game_id: string;
  game_date: string;
  home_team: string;
  home_team_id: number;
  away_team: string;
  away_team_id: number;
  home_players: PlayerStatSave[];
  away_players: PlayerStatSave[];
  winner_prediction: string;
}

export interface RealStats {
  PTS: number;
  REB: number;
  AST: number;
  MIN: string | number;
}

export interface PlayerHistoryEntry {
  player_id: number;
  name: string;
  team: string;
  predicted_stats: { PTS: number; REB: number; AST: number; MIN: number };
  real_stats?: RealStats;
}

export interface MatchHistoryEntry {
  game_id: string;
  game_date: string;
  home_team: string;
  away_team: string;
  home_team_id: number;
  away_team_id: number;
  home_players: PlayerHistoryEntry[];
  away_players: PlayerHistoryEntry[];
  status: "PENDING" | "FINISHED";
  accuracy_score?: number;
  real_winner?: string;
  saved_at: string;
}

export const nbaApi = {
  // CORRECTION MAJEURE ICI : Extraction de .games
  // Renommé en getGames30h pour matcher Home.tsx
  async getGames30h(): Promise<GamesResponse> {
    const response = await fetch(`${API_BASE_URL}/games/30h`);
    if (!response.ok) throw new Error("Failed to fetch games");
    const data = await response.json();
    return data; 
    // Note: Home.tsx gère maintenant data.games via apiResponse?.games
  },

  // Gardé pour compatibilité si utilisé ailleurs, mais redirige vers la même logique
  async get48hGames(): Promise<TodayGame[]> {
    const response = await fetch(`${API_BASE_URL}/games/30h`);
    if (!response.ok) throw new Error("Failed to fetch games");
    const data = await response.json();
    return data.games || [];
  },

  async searchPlayers(query: string): Promise<Player[]> {
    const response = await fetch(`${API_BASE_URL}/players/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Failed to search players");
    return response.json();
  },

  async getTeamRoster(teamId: string): Promise<Player[]> {
    const response = await fetch(`${API_BASE_URL}/team/${teamId}/roster`);
    if (!response.ok) throw new Error("Failed to fetch team roster");
    return response.json();
  },

  async getPlayerSeason(playerId: number): Promise<SeasonStats> {
    const response = await fetch(`${API_BASE_URL}/player/${playerId}/season`);
    if (!response.ok) throw new Error("Failed to fetch player season stats");
    return response.json();
  },

  async getPlayerRecent(playerId: number, limit: number = 10): Promise<GameLog[]> {
    const response = await fetch(`${API_BASE_URL}/player/${playerId}/recent?limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch recent games");
    return response.json();
  },

  async getPlayerVsTeam(playerId: number, teamCode: string): Promise<VsTeamStats> {
    const response = await fetch(`${API_BASE_URL}/player/${playerId}/vs/${teamCode}`);
    if (!response.ok) throw new Error("Failed to fetch vs team stats");
    return response.json();
  },

  async analyzeTrend(playerId: number, stat: string, threshold: number): Promise<TrendResult> {
    const response = await fetch(
      `${API_BASE_URL}/player/${playerId}/trend?stat=${stat}&threshold=${threshold}`
    );
    if (!response.ok) throw new Error("Failed to analyze trend");
    return response.json();
  },

  async predictMatch(
    homeTeamId: string,
    awayTeamId: string,
    homeMissingPlayerIds?: number[],
    awayMissingPlayerIds?: number[]
  ): Promise<MatchPrediction> {
    const params = new URLSearchParams();
    if (homeMissingPlayerIds && homeMissingPlayerIds.length > 0) {
      homeMissingPlayerIds.forEach(id => params.append("home_missing_players", id.toString()));
    }
    if (awayMissingPlayerIds && awayMissingPlayerIds.length > 0) {
      awayMissingPlayerIds.forEach(id => params.append("away_missing_players", id.toString()));
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${API_BASE_URL}/predict/match/${homeTeamId}/${awayTeamId}${queryString}`);
    if (!response.ok) throw new Error("Failed to predict match");
    return response.json();
  },

  async getMatchPredictionV2(
    homeTeamId: string,
    awayTeamId: string,
    homeRest: number = 1,
    awayRest: number = 1,
    homeAbsentIds?: number[],
    awayAbsentIds?: number[]
  ): Promise<MatchPredictionV2Response> {
    const params = new URLSearchParams();
    params.append("home_rest", homeRest.toString());
    params.append("away_rest", awayRest.toString());

    if (homeAbsentIds && homeAbsentIds.length > 0) {
      homeAbsentIds.forEach(id => params.append("home_absent", id.toString()));
    }
    if (awayAbsentIds && awayAbsentIds.length > 0) {
      awayAbsentIds.forEach(id => params.append("away_absent", id.toString()));
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(
      `${API_BASE_URL}/predict/full-match-v2/${homeTeamId}/${awayTeamId}${queryString}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      if (errorData.error && errorData.error.includes("Cache non chargé")) {
        throw new Error("CACHE_WARMING");
      }
      throw new Error(`Failed to predict match: ${errorData.error || response.statusText}`);
    }

    return response.json();
  },

  async predictPlayerStats(
    playerId: number,
    opponentTeamId: string
  ): Promise<PlayerProjection> {
    const response = await fetch(`${API_BASE_URL}/predict/player/${playerId}/vs/${opponentTeamId}`);
    if (!response.ok) throw new Error("Failed to predict player stats");
    return response.json();
  },

  async analyzeMissingPlayer(
    teamCode: string,
    playerId: number
  ): Promise<MissingPlayerAnalysis> {
    const response = await fetch(`${API_BASE_URL}/analytics/team/${teamCode}/missing-player/${playerId}`);
    if (!response.ok) throw new Error("Failed to analyze missing player impact");
    return response.json();
  },

  async getFullMatchPrediction(
    homeTeamId: string,
    awayTeamId: string
  ): Promise<FullMatchPrediction> {
    const response = await fetch(`${API_BASE_URL}/predict/full-match/${homeTeamId}/${awayTeamId}`);
    if (!response.ok) throw new Error("Failed to fetch full match prediction");
    return response.json();
  },

  async getFullMatchPredictionWithAbsents(
    homeTeamId: string,
    awayTeamId: string,
    homeAbsentIds?: number[],
    awayAbsentIds?: number[]
  ): Promise<InteractiveMatchPrediction> {
    const params = new URLSearchParams();
    params.append("home_rest", "1");
    params.append("away_rest", "1");
    
    if (homeAbsentIds && homeAbsentIds.length > 0) {
      homeAbsentIds.forEach(id => params.append("home_absent", id.toString()));
    }
    if (awayAbsentIds && awayAbsentIds.length > 0) {
      awayAbsentIds.forEach(id => params.append("away_absent", id.toString()));
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${API_BASE_URL}/predict/full-match/${homeTeamId}/${awayTeamId}${queryString}`);
    if (!response.ok) throw new Error("Failed to fetch interactive match prediction");
    return response.json();
  },

  async getPlayerDeepAnalytics(
    playerId: number,
    opponentTeamId: string
  ): Promise<PlayerProjection> {
    const response = await fetch(`${API_BASE_URL}/predict/deep-analytics/${playerId}/vs/${opponentTeamId}`);
    if (!response.ok) throw new Error("Failed to fetch player deep analytics");
    return response.json();
  },

  async getPlayerDetailsHistory(
    playerId: number,
    opponentTeamId: string
  ): Promise<PlayerDetailsHistory> {
    const response = await fetch(`${API_BASE_URL}/analysis/player/${playerId}/popup/${opponentTeamId}`);
    if (!response.ok) throw new Error("Failed to fetch player details history");
    return response.json();
  },

  async getCalculatorAnalysis(
    playerId: number,
    projection: number,
    line: number,
    statCategory: string
  ): Promise<CalculatorResult> {
    const response = await fetch(
      `${API_BASE_URL}/predict/calculator?player_id=${playerId}&projection=${projection}&line=${line}&stat_category=${statCategory}`
    );
    if (!response.ok) throw new Error("Failed to fetch calculator analysis");
    return response.json();
  },

  async getPlayerPopupData(
    playerId: number,
    opponentTeamId: string
  ): Promise<PlayerPopupData> {
    const response = await fetch(
      `${API_BASE_URL}/analysis/player/${playerId}/popup/${opponentTeamId}`
    );
    if (!response.ok) throw new Error("Failed to fetch player popup data");
    return response.json();
  },

  async getShootingPrediction(
    homeTeamId: string,
    awayTeamId: string
  ): Promise<ShootingPrediction> {
    const response = await fetch(
      `${API_BASE_URL}/predict/shooting/${homeTeamId}/${awayTeamId}`
    );
    if (!response.ok) throw new Error("Failed to fetch shooting prediction");
    return response.json();
  },

  async getShootingSplits(
    homeTeamCode: string,
    awayTeamCode: string,
    homeAbsentIds?: number[],
    awayAbsentIds?: number[]
  ): Promise<ShootingBattleData> {
    const params = new URLSearchParams();
    if (homeAbsentIds && homeAbsentIds.length > 0) {
      homeAbsentIds.forEach(id => params.append("home_absent", id.toString()));
    }
    if (awayAbsentIds && awayAbsentIds.length > 0) {
      awayAbsentIds.forEach(id => params.append("away_absent", id.toString()));
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(
      `${API_BASE_URL}/predict/shooting-splits/${homeTeamCode}/${awayTeamCode}${queryString}`
    );
    if (!response.ok) throw new Error("Failed to fetch shooting splits");
    return response.json();
  },

  async savePrediction(data: PredictionPayload): Promise<{ success: boolean; id?: number; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/predictions/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to save prediction");
    return response.json();
  },

  async getPredictionHistory(): Promise<PredictionRecord[]> {
    const response = await fetch(`${API_BASE_URL}/predictions/history`);
    if (!response.ok) throw new Error("Failed to fetch prediction history");
    return response.json();
  },

  async saveMatchPrediction(data: MatchSaveRequest): Promise<{ success: boolean; message?: string; id?: number }> {
    const response = await fetch(`${API_BASE_URL}/predictions/save-match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to save match prediction");
    return response.json();
  },

  async getFullMatchPredictionForSave(
    homeId: string | number,
    awayId: string | number,
    homeAbsent: number[] = [],
    awayAbsent: number[] = []
  ): Promise<FullMatchPrediction> {
    const params = new URLSearchParams();
    homeAbsent.forEach(id => params.append("home_absent", id.toString()));
    awayAbsent.forEach(id => params.append("away_absent", id.toString()));

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${API_BASE_URL}/predict/full-match/${homeId}/${awayId}${queryString}`);
    if (!response.ok) throw new Error("Failed to fetch full match prediction");
    return response.json();
  },

  async getMatchHistory(): Promise<MatchHistoryEntry[]> {
    const response = await fetch(`${API_BASE_URL}/predictions/match-history`);
    if (!response.ok) throw new Error("Failed to fetch match history");
    return response.json();
  },
};
