import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { nbaApi, Player } from "@/services/nbaApi";
import { cn } from "@/lib/utils";

interface PlayerSearchProps {
  onSelectPlayer: (player: Player) => void;
  selectedPlayer?: Player;
}

export function PlayerSearch({ onSelectPlayer, selectedPlayer }: PlayerSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["players-search", searchQuery],
    queryFn: () => nbaApi.searchPlayers(searchQuery),
    enabled: searchQuery.length > 1,
  });

  const showResults = isFocused && searchQuery.length > 1 && searchResults && searchResults.length > 0;

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search NBA players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pl-12 h-14 text-lg bg-card border-border focus-visible:ring-primary"
        />
      </div>

      {showResults && (
        <Card className="absolute z-50 w-full mt-2 max-h-96 overflow-y-auto border-border bg-card">
          {searchResults.map((player) => (
            <button
              key={player.id}
              onClick={() => {
                onSelectPlayer(player);
                setSearchQuery("");
              }}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0",
                selectedPlayer?.id === player.id && "bg-primary/10"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-semibold text-foreground">{player.full_name}</p>
                  {player.team && <p className="text-sm text-muted-foreground">{player.team}</p>}
                </div>
                {player.is_active && (
                  <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground font-medium">
                    Active
                  </span>
                )}
              </div>
            </button>
          ))}
        </Card>
      )}

      {isLoading && searchQuery.length > 1 && (
        <div className="absolute z-50 w-full mt-2 p-4 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground text-center">Searching...</p>
        </div>
      )}
    </div>
  );
}
