"use client";

import { useEffect, useState } from "react";
import { checkUserEmailExists } from "./actions";

const DEBOUNCE_MS = 400;

export function useUserEmailCheck(initialEmail = "") {
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
        const trimmed = email.trim();
        if (!trimmed) return;

        const timer = window.setTimeout(async () => {
            const exists = await checkUserEmailExists(trimmed);
            setEmailExists(exists);
            setCheckingEmail(false);
        }, DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
    }, [email]);

    return {
        email,
        emailExists,
        checkingEmail,
        handleEmailChange,
        resetEmail,
    };
}
