export function handleError(error: unknown, fallback = 'Error inesperado'): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('network') || msg.includes('fetch')) return 'Error de conexión. Verifica tu internet.'
    if (msg.includes('auth') || msg.includes('credentials')) return 'Credenciales inválidas.'
    if (msg.includes('duplicate') || msg.includes('already exists')) return 'Este registro ya existe.'
    if (msg.includes('not found')) return 'Registro no encontrado.'
    if (msg.includes('permission') || msg.includes('policy')) return 'No tienes permisos para esta acción.'
    if (msg.includes('rate limit') || msg.includes('too many')) return 'Demasiadas solicitudes. Intenta más tarde.'
  }
  return fallback
}
