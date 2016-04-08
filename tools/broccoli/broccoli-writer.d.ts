declare module "broccoli-writer" {
  class Writer {
    write(readTree: (tree) => Promise<string>, destDir: string): Promise<any>;
  }
  export = Writer;
}
