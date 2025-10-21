import { useState, useCallback } from 'react';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../types"
import { useAuthStore } from '../authStore/authStore';

async function ApiFetch(type: "register" | "login", body: LoginRequest | RegisterRequest) {
  return await fetch('http://localhost:3000/api/' + type, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify(body),
  });
}



export const useLogin = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((Err: any) => {
    if (Err instanceof Error) {
      setError(Err.message);
    } else if (typeof Err == "string") {
      setError(Err);
    } else {
      setError("Unexpected error")
    }
  }, [])

  const attemptLogin = useCallback(async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await ApiFetch("login", data)

      if (!response.ok) {
        throw new Error("Failed to login");
      }

      const loginData: LoginResponse = await response.json();
      const setUser = useAuthStore.getState().setUser;
      setUser(loginData.user ?? null);
      localStorage.setItem('authToken', loginData.token ?? '');
      return loginData;

    } catch (err) {
      handleError(err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [])
  

  return {
    loading,
    error,
    attemptLogin,
  };
}

export const useRegister = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((Err: any) => {
    if (Err instanceof Error) {
      setError(Err.message);
    } else if (typeof Err == "string") {
      setError(Err);
    } else {
      setError("Unexpected error")
    }
  }, [])

  const attemptRegister = useCallback(async (data: RegisterRequest): Promise<RegisterResponse> => {
    setLoading(true);
    try {
      const response = await ApiFetch("register", data);
      if (!response.ok) {
        throw new Error("Failed to register");
      }
      const result : RegisterResponse = await response.json();
      const setUser = useAuthStore.getState().setUser;
      setUser(result.user ?? null);
      localStorage.setItem('authToken', result.token ?? '');
      return result;
    } catch (err) {
      handleError(err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return {
    loading,
    error,
    attemptRegister,
  };
}

