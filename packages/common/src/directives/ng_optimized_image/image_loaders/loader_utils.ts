export function isValidPath(path: unknown) {
  const isString = typeof path === 'string';

  if (!isString || path.trim() === '') {
    return false;
  }

  try {
    const url = new URL(path);
    return true;
  } catch {
    return false;
  }
}

export function normalizePath(path: string) {
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

export function normalizeSrc(src: string) {
  return src.startsWith('/') ? src.slice(1) : src;
}