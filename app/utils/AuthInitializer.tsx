"use client";
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux/hook";
import { fetchProfile } from "@/app/redux/slices/ProfileSlice";

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const profileLoaded = useAppSelector((state) => !!state.profile.data);
  const profileLoading = useAppSelector((state) => state.profile.loading);
  const hasAttemptedFetch = useRef(false);

  useEffect(() => {
    if (token && !profileLoaded && !profileLoading && !hasAttemptedFetch.current) {
      hasAttemptedFetch.current = true;
      dispatch(fetchProfile()).catch((err) => {
        console.error("Failed to fetch profile on init:", err);
      });
    }

    if (!token) {
      hasAttemptedFetch.current = false;
    }
  }, [token, profileLoaded, profileLoading, dispatch]);

  return <>{children}</>;
}