import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

export async function deleteUser(userId: string): Promise<void> {
  const { error: authError } = await supabase.auth.admin.deleteUser(userId)

  if (authError) {
    logger.error({ error: authError, userId }, 'Admin: failed to delete auth user')
    throw new Error('Failed to delete user')
  }

  logger.info({ userId }, 'Admin: user deleted successfully')
}
