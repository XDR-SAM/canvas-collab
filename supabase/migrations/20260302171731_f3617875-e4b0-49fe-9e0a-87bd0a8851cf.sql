-- Enable realtime for board_sessions (used for live cursors/presence)
ALTER PUBLICATION supabase_realtime ADD TABLE public.board_sessions;