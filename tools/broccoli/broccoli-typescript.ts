/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../../node_modules/typescript/bin/typescript.d.ts" />

import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
import ts = require('typescript');
import {wrapDiffingPlugin, DiffingBroccoliPlugin, DiffResult} from './diffing-broccoli-plugin';


type FileRegistry = ts.Map<{version: number}>;

const FS_OPTS = {
  encoding: 'utf-8'
};


/**
 * Broccoli plugin that implements incremental Typescript compiler.
 *
 * It instantiates a typescript compiler instance that keeps all the state about the project and
 * can reemit only the files that actually changed.
 *
 * Limitations: only files that map directly to the changed source file via naming conventions are
 * reemited. This primarily affects code that uses `const enum`s, because changing the enum value
 * requires global emit, which can affect many files.
 */
class DiffingTSCompiler implements DiffingBroccoliPlugin {
  private tsOpts: ts.CompilerOptions;
  private fileRegistry: FileRegistry = Object.create(null);
  private rootFilePaths: string[];
  private tsServiceHost: ts.LanguageServiceHost;
  private tsService: ts.LanguageService;
  private firstRun: boolean = true;
  private previousRunFailed: boolean = false;

  static includeExtensions = ['.ts'];
  static excludeExtensions = ['.d.ts'];

  constructor(public inputPath: string, public cachePath: string, public options) {
    this.tsOpts = Object.create(options);
    this.tsOpts.outDir = this.cachePath;
    this.tsOpts.target = (<any>ts).ScriptTarget[options.target];
    this.rootFilePaths = options.rootFilePaths ? options.rootFilePaths.splice(0) : [];
    this.tsServiceHost = new CustomLanguageServiceHost(this.tsOpts, this.rootFilePaths,
                                                       this.fileRegistry, this.inputPath);
    this.tsService = ts.createLanguageService(this.tsServiceHost, ts.createDocumentRegistry());
  }


  rebuild(treeDiff: DiffResult) {
    let pathsToEmit = [];
    let pathsWithErrors = [];

    treeDiff.addedPaths.concat(treeDiff.changedPaths)
        .forEach((tsFilePath) => {
          if (!this.fileRegistry[tsFilePath]) {
            this.fileRegistry[tsFilePath] = {version: 0};
            this.rootFilePaths.push(tsFilePath);
          } else {
            this.fileRegistry[tsFilePath].version++;
          }

          pathsToEmit.push(tsFilePath);
        });

    treeDiff.removedPaths.forEach((tsFilePath) => {
      console.log('removing outputs for', tsFilePath);

      this.rootFilePaths.splice(this.rootFilePaths.indexOf(tsFilePath), 1);
      this.fileRegistry[tsFilePath] = null;
      this.removeOutputFor(tsFilePath);
    });

    if (this.firstRun) {
      this.firstRun = false;
      this.doFullBuild();
    } else {
      pathsToEmit.forEach((tsFilePath) => {
        let output = this.tsService.getEmitOutput(tsFilePath);

        if (output.emitSkipped) {
          let errorFound = this.logError(tsFilePath);
          if (errorFound) {
            pathsWithErrors.push(tsFilePath);
          }
        } else {
          output.outputFiles.forEach(o => {
            let destDirPath = path.dirname(o.name);
            fse.mkdirsSync(destDirPath);
            fs.writeFileSync(o.name, o.text, FS_OPTS);
          });
        }
      });

      if (pathsWithErrors.length) {
        this.previousRunFailed = true;
        var error = new Error('Typescript found errors listed above...');
        error['showStack'] = false;
        throw error;
      } else if (this.previousRunFailed) {
        this.doFullBuild();
      }
    }
  }


  private logError(tsFilePath) {
    let allDiagnostics = this.tsService.getCompilerOptionsDiagnostics()
                             .concat(this.tsService.getSyntacticDiagnostics(tsFilePath))
                             .concat(this.tsService.getSemanticDiagnostics(tsFilePath));

    allDiagnostics.forEach(diagnostic => {
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      if (diagnostic.file) {
        let{line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        console.log(`  Error ${diagnostic.file.fileName} (${line + 1},${character + 1}): ` +
                    `${message}`);
      } else {
        console.log(`  Error: ${message}`);
      }
    });

    return !!allDiagnostics.length;
  }


  private doFullBuild() {
    let program = this.tsService.getProgram();
    let emitResult = program.emit(undefined, function(absoluteFilePath, fileContent) {
      fse.mkdirsSync(path.dirname(absoluteFilePath));
      fs.writeFileSync(absoluteFilePath, fileContent, FS_OPTS);
    });

    if (emitResult.emitSkipped) {
      let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
      let errorMessages = [];

      allDiagnostics.forEach(diagnostic => {
        var {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        errorMessages.push(
            `  ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
      });

      if (errorMessages.length) {
        this.previousRunFailed = true;
        console.log(errorMessages.join('\n'));
        var error = new Error('Typescript found errors listed above...');
        error['showStack'] = false;
        throw error;
      } else {
        this.previousRunFailed = false;
      }
    }
  }


  private removeOutputFor(tsFilePath: string) {
    let absoluteJsFilePath = path.join(this.cachePath, tsFilePath.replace(/\.ts$/, '.js'));
    let absoluteMapFilePath = path.join(this.cachePath, tsFilePath.replace(/.ts$/, '.js.map'));
    let absoluteDtsFilePath = path.join(this.cachePath, tsFilePath.replace(/\.ts$/, '.d.ts'));

    if (fs.existsSync(absoluteJsFilePath)) {
      fs.unlinkSync(absoluteJsFilePath);
      fs.unlinkSync(absoluteMapFilePath);
      fs.unlinkSync(absoluteDtsFilePath);
    }
  }
}


class CustomLanguageServiceHost implements ts.LanguageServiceHost {
  private currentDirectory: string;
  private defaultLibFilePath: string;


  constructor(private compilerOptions: ts.CompilerOptions, private fileNames: string[],
              private fileRegistry: FileRegistry, private treeInputPath: string) {
    this.currentDirectory = process.cwd();
    this.defaultLibFilePath = ts.getDefaultLibFilePath(compilerOptions).replace(/\\/g, '/');
  }


  getScriptFileNames(): string[] { return this.fileNames; }


  getScriptVersion(fileName: string): string {
    return this.fileRegistry[fileName] && this.fileRegistry[fileName].version.toString();
  }


  /**
   * This method is called quite a bit to lookup 3 kinds of paths:
   * 1/ files in the fileRegistry
   *   - these are the files in our project that we are watching for changes
   *   - in the future we could add caching for these files and invalidate the cache when
   *     the file is changed lazily during lookup
   * 2/ .d.ts and library files not in the fileRegistry
   *   - these are not our files, they come from tsd or typescript itself
   *   - these files change only rarely but since we need them very rarely, it's not worth the
   *     cache invalidation hassle to cache them
   * 3/ bogus paths that typescript compiler tries to lookup during import resolution
   *   - these paths are tricky to cache since files come and go and paths that was bogus in the
   *     past might not be bogus later
   *
   * In the initial experiments the impact of this caching was insignificant (single digit %) and
   * not worth the potential issues with stale cache records.
   */
  getScriptSnapshot(tsFilePath: string): ts.IScriptSnapshot {
    let absoluteTsFilePath = (tsFilePath == this.defaultLibFilePath) ?
                                 tsFilePath :
                                 path.join(this.treeInputPath, tsFilePath);

    if (!fs.existsSync(absoluteTsFilePath)) {
      // TypeScript seems to request lots of bogus paths during import path lookup and resolution,
      // so we we just return undefined when the path is not correct.
      return undefined;
    }
    return ts.ScriptSnapshot.fromString(fs.readFileSync(absoluteTsFilePath, FS_OPTS));
  }


  getCurrentDirectory(): string { return this.currentDirectory; }


  getCompilationSettings(): ts.CompilerOptions { return this.compilerOptions; }


  getDefaultLibFileName(options: ts.CompilerOptions): string {
    // ignore options argument, options should not change during the lifetime of the plugin
    return this.defaultLibFilePath;
  }
}


export default wrapDiffingPlugin(DiffingTSCompiler);
