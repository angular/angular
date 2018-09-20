declare module 'canonical-path' {
  export function normalize(p: string): string;
  export function join(...paths: any[]): string;
  export function resolve(...pathSegments: any[]): string;
  export function isAbsolute(p: string): boolean;
  export function relative(from: string, to: string): string;
  export function dirname(p: string): string;
  export function basename(p: string, ext?: string): string;
  export function extname(p: string): string;
  export var sep: string;
  export var delimiter: string;
  export function parse(p: string): ParsedPath;
  export function format(pP: ParsedPath): string;
}
