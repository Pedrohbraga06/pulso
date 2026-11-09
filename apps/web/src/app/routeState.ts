export function destinationFromState(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('from' in state)) {
    return '/app/overview';
  }
  const from = state.from;
  if (typeof from !== 'object' || from === null || !('pathname' in from)) {
    return '/app/overview';
  }
  const pathname = from.pathname;
  return typeof pathname === 'string' && (pathname === '/app' || pathname.startsWith('/app/'))
    ? pathname
    : '/app/overview';
}
