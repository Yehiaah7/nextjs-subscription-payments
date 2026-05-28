import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types_db';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/utils/supabase/env';

export const createAdminClient = () =>
  createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey());
