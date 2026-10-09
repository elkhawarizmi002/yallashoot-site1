import { permanentRedirect } from "next/navigation";

export default function StandingsIndexPage() {
  // Default to Premier League as the primary standings hub
  permanentRedirect("/league/premier-league-7/standings");
}
