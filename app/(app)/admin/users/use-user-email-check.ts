"use client";

import { useEffect, useState } from "react";
import { checkUserEmailExists } from "./actions";

const DEBOUNCE_MS = 400;

type UseUserEmailCheckOptions = {
    initialEmail?: string;
    excludeUserId?: string;
    enabled?: boolean;
};

export function useUserEmailCheck({
    initialEmail = "",
    excludeUserId,
    enabled = true,
}: UseUserEmailCheckOptions = {}) {
    const [email, setEmail] = useState(initialEmail);
    const [emailExists, setEmailExists] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);

    function handleEmailChange(value: string) {
        setEmail(value);
        const trimmed = value.trim();
        if (!trimmed) {
            setEmailExists(false);
            setCheckingEmail(false);
            return;
        }
        setCheckingEmail(true);
    }

    function resetEmail(value = "") {
        setEmail(value);
        setEmailExists(false);
        setCheckingEmail(false);
    }

    useEffect(() => {
        if (!enabled) return;

        const trimmed = email.trim();
        if (!trimmed) return;

        const timer = window.setTimeout(async () => {
            const exists = await checkUserEmailExists(trimmed, excludeUserId);
            setEmailExists(exists);
            setCheckingEmail(false);
        }, DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
    }, [email, excludeUserId, enabled]);

    return {
        email,
        emailExists,
        checkingEmail,
        handleEmailChange,
        resetEmail,
    };
}
