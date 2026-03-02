import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CursorData {
  user_id: string;
  cursor_x: number;
  cursor_y: number;
  name: string;
  color: string;
}

const CURSOR_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
];

function hashColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

const LiveCursors = ({ boardId, panOffset, zoom }: { boardId: string; panOffset: { x: number; y: number }; zoom: number }) => {
  const { user, profile } = useAuth();
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());
  const lastSent = useRef(0);

  // Upsert own session
  useEffect(() => {
    if (!user || !boardId) return;
    const upsertSession = async () => {
      await supabase.from("board_sessions").upsert(
        { board_id: boardId, user_id: user.id, cursor_x: 0, cursor_y: 0, last_seen: new Date().toISOString() },
        { onConflict: "board_id,user_id" }
      );
    };
    upsertSession();

    // Heartbeat
    const interval = setInterval(() => {
      supabase.from("board_sessions").update({ last_seen: new Date().toISOString() }).eq("board_id", boardId).eq("user_id", user.id).then();
    }, 10000);

    return () => {
      clearInterval(interval);
      supabase.from("board_sessions").delete().eq("board_id", boardId).eq("user_id", user.id).then();
    };
  }, [user, boardId]);

  // Subscribe to realtime cursor changes
  useEffect(() => {
    if (!user || !boardId) return;
    const channel = supabase
      .channel(`board-cursors-${boardId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "board_sessions", filter: `board_id=eq.${boardId}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setCursors((prev) => {
              const next = new Map(prev);
              // Find by matching record
              const old = payload.old as any;
              if (old?.user_id) next.delete(old.user_id);
              return next;
            });
            return;
          }
          const rec = payload.new as any;
          if (rec.user_id === user.id) return;
          setCursors((prev) => {
            const next = new Map(prev);
            next.set(rec.user_id, {
              user_id: rec.user_id,
              cursor_x: rec.cursor_x || 0,
              cursor_y: rec.cursor_y || 0,
              name: rec.user_id.slice(0, 6),
              color: hashColor(rec.user_id),
            });
            return next;
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, boardId]);

  // Broadcast own cursor
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!user || !boardId) return;
      const now = Date.now();
      if (now - lastSent.current < 50) return; // throttle to 20fps
      lastSent.current = now;
      const canvas = document.querySelector("canvas");
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = (e.clientX - rect.left - panOffset.x) / zoom;
      const cy = (e.clientY - rect.top - panOffset.y) / zoom;
      supabase.from("board_sessions").update({ cursor_x: cx, cursor_y: cy, last_seen: new Date().toISOString() }).eq("board_id", boardId).eq("user_id", user.id).then();
    },
    [user, boardId, panOffset, zoom]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {Array.from(cursors.values()).map((c) => {
        const screenX = c.cursor_x * zoom + panOffset.x;
        const screenY = c.cursor_y * zoom + panOffset.y;
        return (
          <div
            key={c.user_id}
            className="absolute transition-transform duration-75"
            style={{ transform: `translate(${screenX}px, ${screenY}px)` }}
          >
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
              <path d="M0 0L16 12H6L4 20L0 0Z" fill={c.color} stroke="white" strokeWidth="1" />
            </svg>
            <span
              className="absolute left-4 top-4 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: c.color }}
            >
              {c.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default LiveCursors;
