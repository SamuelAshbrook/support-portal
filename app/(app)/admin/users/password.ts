export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;

export function validatePassword(password: string): string | null {
    if (password.length < PASSWORD_MIN)
        return `Password must be at least ${PASSWORD_MIN} characters`;
    if (password.length > PASSWORD_MAX)
        return `Password must be ${PASSWORD_MAX} characters or less`;
    if (!/[0-9]/.test(password))
        return "Password must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(password))
        return "Password must contain at least one symbol";
    return null;
}
