interface FooterProps {
  lastUpdated: Record<string, string | null>;
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return "Never";
  const date = new Date(iso);
  return date.toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Toronto",
  });
}

export function Footer({ lastUpdated }: FooterProps) {
  const entries = Object.entries(lastUpdated);

  return (
    <footer className="mt-12 pb-8 px-4 text-center text-sm text-[var(--color-text-muted)]">
      <p className="mb-4 text-xs">
        Prices may vary by location. Based on Toronto pricing.
      </p>

      {entries.length > 0 && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {entries.map(([chainId, timestamp]) => (
            <span key={chainId} className="text-xs">
              <span className="font-medium capitalize">{chainId}</span>:{" "}
              {formatTimestamp(timestamp)}
            </span>
          ))}
        </div>
      )}
    </footer>
  );
}
