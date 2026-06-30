export function formatExcerpt(
    text: string,
    maxWords = 20,
): string {
    const words = text.trim().replace(/\s+/g, ' ').split(' ');
    if (words.length <= maxWords) return words.join(' ');
    return `${words.slice(0, maxWords).join(' ')}...`;
}