declare module 'delete-empty' {
  interface Options {
    dryRun: boolean;
    verbose: boolean;
    filter: (filePath: string) => boolean;
  }
  export default function deleteEmpty(cwd: string, options?: Options): Promise<string[]>;
  export default function deleteEmpty(cwd: string, options?: Options, callback?: (err: any, deleted: string[]) => void): void;
  export function sync(cwd: string, options?: Options): string[];
}
