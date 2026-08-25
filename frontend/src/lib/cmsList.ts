/** Prefer live CMS rows (including empty). Only use seed defaults before first load. */
export function cmsList<T>(data: T[] | undefined, defaults: T[]): T[] {
  return data !== undefined ? data : defaults
}
