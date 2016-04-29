import * as ts from 'typescript';
import * as path from 'path';
import {convertDecorators} from 'tsickle';

const DEBUG = false;
function debug(msg: string, ...o: any[]) {
  if (DEBUG) console.log(msg, ...o);
}

/**
 * Implementation of CompilerHost that forwards all methods to another instance.
 * Useful for partial implementations to override only methods they care about.
 */
export abstract class DelegatingHost implements ts.CompilerHost {
  constructor(protected delegate: ts.CompilerHost) {}
  getSourceFile =
      (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) =>
          this.delegate.getSourceFile(fileName, languageVersion, onError);

  getCancellationToken = () => this.delegate.getCancellationToken();
  getDefaultLibFileName = (options: ts.CompilerOptions) =>
      this.delegate.getDefaultLibFileName(options);
  getDefaultLibLocation = () => this.delegate.getDefaultLibLocation();
  writeFile: ts.WriteFileCallback = this.delegate.writeFile;
  getCurrentDirectory = () => this.delegate.getCurrentDirectory();
  getCanonicalFileName = (fileName: string) => this.delegate.getCanonicalFileName(fileName);
  useCaseSensitiveFileNames = () => this.delegate.useCaseSensitiveFileNames();
  getNewLine = () => this.delegate.getNewLine();
  fileExists = (fileName: string) => this.delegate.fileExists(fileName);
  readFile = (fileName: string) => this.delegate.readFile(fileName);
  trace = (s: string) => this.delegate.trace(s);
  directoryExists = (directoryName: string) => this.delegate.directoryExists(directoryName);
}
const TSICKLE_SUPPORT = `interface DecoratorInvocation {
  type: Function;
  args?: any[];
}
`;
export class CodeGeneratorHost extends DelegatingHost {
  // Additional diagnostics gathered by pre- and post-emit transformations.
  public diagnostics: ts.Diagnostic[] = [];
  constructor(delegate: ts.CompilerHost, private options: ts.CompilerOptions) { super(delegate); }

  getSourceFile =
      (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) => {
        const originalContent = this.delegate.readFile(fileName);
        let newContent = originalContent;
        if (!/\.d\.ts$/.test(fileName)) {
          const converted = convertDecorators(fileName, originalContent);
          if (converted.diagnostics) {
            this.diagnostics.push(...converted.diagnostics);
          }
          newContent = TSICKLE_SUPPORT + converted.output;
          debug(newContent);
        }
        return ts.createSourceFile(fileName, newContent, languageVersion, true);
      }
}

export function wrapCompilerHost(delegate: ts.CompilerHost,
                                 options: ts.CompilerOptions): CodeGeneratorHost {
  return new CodeGeneratorHost(delegate, options);
}