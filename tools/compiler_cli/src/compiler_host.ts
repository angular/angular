import * as ts from 'typescript';
import * as path from 'path';
import {convertDecorators} from 'tsickle';
import {NodeReflectorHost} from './reflector_host';
import {AngularCompilerOptions} from './codegen';

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

export class TsickleHost extends DelegatingHost {
  // Additional diagnostics gathered by pre- and post-emit transformations.
  public diagnostics: ts.Diagnostic[] = [];
  private TSICKLE_SUPPORT = `interface DecoratorInvocation {
    type: Function;
    args?: any[];
  }
  `;
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
          newContent = this.TSICKLE_SUPPORT + converted.output;
          debug(newContent);
        }
        return ts.createSourceFile(fileName, newContent, languageVersion, true);
      }
}

export class MetadataWriterHost extends DelegatingHost {
  private reflectorHost: NodeReflectorHost;
  constructor(delegate: ts.CompilerHost, program: ts.Program, options: ts.CompilerOptions,
              ngOptions: AngularCompilerOptions) {
    super(delegate);
    this.reflectorHost = new NodeReflectorHost(program, this, options, ngOptions);
  }

  writeFile: ts.WriteFileCallback = (fileName: string, data: string, writeByteOrderMark: boolean,
                                     onError?: (message: string) => void,
                                     sourceFiles?: ts.SourceFile[]) => {
    if (/\.d\.ts$/.test(fileName)) {
      // Let the original file be written first; this takes care of creating parent directories
      this.delegate.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);

      // TODO: remove this early return after https://github.com/Microsoft/TypeScript/pull/8412 is
      // released
      return;
    }

    if (!sourceFiles) {
      throw new Error('Metadata emit requires the sourceFiles are passed to WriteFileCallback. ' +
                      'Update to TypeScript ^1.9.0-dev');
    }
    if (sourceFiles.length > 1) {
      throw new Error('Bundled emit with --out is not supported');
    }
    this.reflectorHost.writeMetadata(fileName, sourceFiles[0]);
  }
}
