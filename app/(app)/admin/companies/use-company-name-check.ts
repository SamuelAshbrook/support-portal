"use client";

import { useEffect, useState } from "react";
import { checkCompanyNameExists } from "./actions";

const DEBOUNCE_MS = 400;

type UseCompanyNameCheckOptions = {
    initialName?: string;
    excludeCompanyId?: string;
    enabled?: boolean;
};

export function useCompanyNameCheck({
    initialName = "",
    excludeCompanyId,
    enabled = true,
}: UseCompanyNameCheckOptions = {}) {
    const [name, setName] = useState(initialName);
    const [nameExists, setNameExists] = useState(false);
    const [checkingName, setCheckingName] = useState(false);

    function handleNameChange(value: string) {
        setName(value);
        const trimmed = value.trim();
        if (!trimmed) {
            setNameExists(false);
            setCheckingName(false);
            return;
        }
        setCheckingName(true);
    }

    function resetName(value = "") {
        setName(value);
        setNameExists(false);
        setCheckingName(false);
    }

    useEffect(() => {
        if (!enabled) return;

        const trimmed = name.trim();
        if (!trimmed) return;

        const timer = window.setTimeout(async () => {
            const exists = await checkCompanyNameExists(trimmed, excludeCompanyId);
            setNameExists(exists);
            setCheckingName(false);
        }, DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
    }, [name, excludeCompanyId, enabled]);

    return {
        name,
        nameExists,
        checkingName,
        handleNameChange,
        resetName,
    };
}
