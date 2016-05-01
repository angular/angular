const SAFE_STYLE_VALUE = /^([-,."'%_!# a-zA-Z0-9]+|(?:rgb|hsl)a?\([0-9.%, ]+\))$/;

export function sanitizeStyle(value: string): string {
  if (String(value).match(SAFE_STYLE_VALUE)) return value;
  return 'unsafe';
}
