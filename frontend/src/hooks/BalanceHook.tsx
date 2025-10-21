import { useState, useCallback, useEffect } from 'react';
import { ChargeBalanceRequest, ChargeBalanceResponse } from "../types";
import { useAuthStore } from '../authStore/authStore';
const ApiFetch = async (data: ChargeBalanceRequest) => {
    return await fetch("http://localhost:3000/payment/charge", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
    })
}




export function useBalanceCharge() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [balance, setBalance] = useState<number>(0);
    useEffect(() => {
        fetchBalance();
    }, []);
    const handleError = useCallback((err: any) => {
        if (err instanceof Error) {
            setError(err.message)
        } else if (typeof err === 'string') {
            setError(err);
        } else {
            setError('An unexpected error occurred');
        }
    }, [])

    const fetchBalance = async () => {
        const response = await fetch("http://localhost:3000/payment/balance", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
        });

        if (!response.ok) {
            throw new Error("Error fetching balance");
        }

        const data = await response.json();
        setBalance(data ?? 0);
        useAuthStore.getState().updateBalance(data.newBalance ?? 0);
    }

    const chargeAmount = useCallback(async (amount: number): Promise<ChargeBalanceResponse> => {
        try {
            const response = await ApiFetch({ amount: amount })
            if (!response.ok) {
                throw new Error("Error when attempting to charge balance")
            }

            const data: ChargeBalanceResponse = await response.json()
            setBalance(data.newBalance ?? 0);
            useAuthStore.getState().updateBalance(data.newBalance ?? 0);
            return data;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [])


    return {
        loading,
        error,
        chargeAmount,
        balance,
        fetchBalance
    }

}