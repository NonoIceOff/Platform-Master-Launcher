/** Cache session côté renderer — sans token (proxy IPC uniquement) */
export function clearSessionTokenCache(): void {
  // no-op : le token reste dans le processus principal
}
