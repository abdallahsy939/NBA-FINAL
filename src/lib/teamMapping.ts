// Mapping of team names to NBA team codes
export const TEAM_NAME_TO_CODE: Record<string, string> = {
  // Eastern Conference - Atlantic
  "boston celtics": "BOS",
  "celtics": "BOS",
  "brooklyn nets": "BKN",
  "nets": "BKN",
  "new york knicks": "NYK",
  "knicks": "NYK",
  "philadelphia 76ers": "PHI",
  "76ers": "PHI",
  "toronto raptors": "TOR",
  "raptors": "TOR",

  // Eastern Conference - Central
  "chicago bulls": "CHI",
  "bulls": "CHI",
  "cleveland cavaliers": "CLE",
  "cavaliers": "CLE",
  "detroit pistons": "DET",
  "pistons": "DET",
  "indiana pacers": "IND",
  "pacers": "IND",
  "milwaukee bucks": "MIL",
  "bucks": "MIL",

  // Eastern Conference - Southeast
  "atlanta hawks": "ATL",
  "hawks": "ATL",
  "charlotte hornets": "CHA",
  "hornets": "CHA",
  "miami heat": "MIA",
  "heat": "MIA",
  "orlando magic": "ORL",
  "magic": "ORL",
  "washington wizards": "WAS",
  "wizards": "WAS",

  // Western Conference - Southwest
  "dallas mavericks": "DAL",
  "mavericks": "DAL",
  "houston rockets": "HOU",
  "rockets": "HOU",
  "memphis grizzlies": "MEM",
  "grizzlies": "MEM",
  "new orleans pelicans": "NOP",
  "pelicans": "NOP",
  "san antonio spurs": "SAS",
  "spurs": "SAS",

  // Western Conference - Northwest
  "denver nuggets": "DEN",
  "nuggets": "DEN",
  "minnesota timberwolves": "MIN",
  "timberwolves": "MIN",
  "oklahoma city thunder": "OKC",
  "thunder": "OKC",
  "portland trail blazers": "POR",
  "trail blazers": "POR",
  "utah jazz": "UTA",
  "jazz": "UTA",

  // Western Conference - Pacific
  "golden state warriors": "GSW",
  "warriors": "GSW",
  "los angeles clippers": "LAC",
  "clippers": "LAC",
  "los angeles lakers": "LAL",
  "lakers": "LAL",
  "phoenix suns": "PHX",
  "suns": "PHX",
  "sacramento kings": "SAC",
  "kings": "SAC",
};

export function getTeamCode(teamName: string): string {
  const normalized = teamName.toLowerCase().trim();
  return TEAM_NAME_TO_CODE[normalized] || teamName.toUpperCase().substring(0, 3);
}
