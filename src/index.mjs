/**
 * ops-lab entry point.
 * This module will grow as the project evolves.
 */

export function healthCheck() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
