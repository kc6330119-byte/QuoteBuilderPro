export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDollars(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

export function slugify(value: string, fallback = "item") {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback
  );
}

// Up-to-two-letter initials. Drops any email domain, treats punctuation as a separator.
export function getInitials(value: string, fallbackLetter = "U") {
  const words = value
    .replace(/@.*/, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  return ((words[0]?.[0] ?? fallbackLetter) + (words[1]?.[0] ?? "")).toUpperCase();
}
