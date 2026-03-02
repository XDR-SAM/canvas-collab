-- Add unique constraint on board_sessions for upsert
ALTER TABLE public.board_sessions ADD CONSTRAINT board_sessions_board_user_unique UNIQUE (board_id, user_id);