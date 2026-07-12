import { MapPin, Calendar, Users, BookOpen } from "lucide-react";

interface WorkshopHeaderProps {
  name: string;
  cohort: string;
  date: string;
  location: string;
  hasData: boolean;
}

export function WorkshopHeader({
  name,
  cohort,
  date,
  location,
  hasData,
}: WorkshopHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {hasData ? "Live Workshop Report" : "Workshop Report"}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl">
          {name || "Workshop Overview"}
        </h1>
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {cohort && (
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{cohort}</span>
          </div>
        )}
        {date && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{date}</span>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>{location}</span>
          </div>
        )}
      </div>
    </div>
  );
}
