import * as ts from 'typescript';
import * as path from 'path';

const DEBUG = false;
function debug(msg: string, ...o: any[]) {
  if (DEBUG) console.log(msg, ...o);
}

export interface CodeGeneratorHost extends ts.CompilerHost {}

/**
 * Implementation of CompilerHost that forwards all methods to another instance.
 * Useful for partial implementations to override only methods they care about.
 */
abstract class DelegatingHost implements ts.CompilerHost {
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

class ReverseModuleResolutionHost extends DelegatingHost implements CodeGeneratorHost {
  constructor(delegate: ts.CompilerHost, private options: ts.CompilerOptions) { super(delegate); }

  resolveModuleNames(moduleNames: string[], containingFile: string): ts.ResolvedModule[] {
    return moduleNames.map(moduleName => ts.resolveModuleName(moduleName, containingFile, this.options, this.delegate).resolvedModule);
  }
}

export function wrapCompilerHost(delegate: ts.CompilerHost,
                                 options: ts.CompilerOptions): CodeGeneratorHost {
  return new ReverseModuleResolutionHost(delegate, options);
}