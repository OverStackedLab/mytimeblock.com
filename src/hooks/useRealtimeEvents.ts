import { useEffect } from "react";
import { supabase } from "../supabase/config";
import { useAppDispatch } from "./useAppDispatch";
import {
  eventAdded,
  eventUpdated,
  eventDeleted,
} from "../services/calendarSlice";
import type { Event as DbEvent } from "../supabase/types";

export function useRealtimeEvents(userId: string | undefined) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("events-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            dispatch(eventAdded(payload.new as DbEvent));
          } else if (payload.eventType === "UPDATE") {
            dispatch(eventUpdated(payload.new as DbEvent));
          } else if (payload.eventType === "DELETE") {
            dispatch(eventDeleted((payload.old as { id: string }).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, dispatch]);
}
