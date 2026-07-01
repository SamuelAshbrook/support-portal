function pickRelativeUnit(date: Date) {
    const seconds = Math.round((date.getTime() - Date.now()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const weeks = Math.round(days / 7);
    const months = Math.round(days / 30);
    const years = Math.round(days / 365);

    if (Math.abs(seconds) < 60) return [seconds, "second"] as const;
    if (Math.abs(minutes) < 60) return [minutes, "minute"] as const;
    if (Math.abs(hours) < 24) return [hours, "hour"] as const;
    if (Math.abs(days) < 7) return [days, "day"] as const;
    if (Math.abs(weeks) < 5) return [weeks, "week"] as const;
    if (Math.abs(months) < 12) return [months, "month"] as const;
    return [years, "year"] as const;
}

export function formatCreatedAgo(date: Date): string {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });
    const [value, unit] = pickRelativeUnit(date);
    return `Created ${rtf.format(value, unit)}`;
}

export function formatTicketDate(date: Date): string {
    const datePart = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);

    const timePart = new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    })
    .format(date)
    .replace(/\s/g, "");

    return `${datePart} at ${timePart}`;
}