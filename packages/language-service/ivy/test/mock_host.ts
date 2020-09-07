/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';
import * as ts from 'typescript/lib/tsserverlibrary';

const logger: ts.server.Logger = {
  close(): void{},
  hasLevel(level: ts.server.LogLevel): boolean {
    return false;
  },
  loggingEnabled(): boolean {
    return false;
  },
  perftrc(s: string): void{},
  info(s: string): void{},
  startGroup(): void{},
  endGroup(): void{},
  msg(s: string, type?: ts.server.Msg): void{},
  getLogFileName(): string |
      undefined {
        return;
      },
};

export const TEST_SRCDIR = process.env.TEST_SRCDIR!;
export const PROJECT_DIR =
    join(TEST_SRCDIR, 'angular', 'packages', 'language-service', 'test', 'project');
export const TSCONFIG = join(PROJECT_DIR, 'tsconfig.json');
export const APP_COMPONENT = join(PROJECT_DIR, 'app', 'app.component.ts');
export const APP_MAIN = join(PROJECT_DIR, 'app', 'main.ts');
export const PARSING_CASES = join(PROJECT_DIR, 'app', 'parsing-cases.ts');
export const TEST_TEMPLATE = join(PROJECT_DIR, 'app', 'test.ng');

const NOOP_FILE_WATCHER: ts.FileWatcher = {
  close() {}
};

export const host: ts.server.ServerHost = {
  ...ts.sys,
  readFile(absPath: string, encoding?: string): string |
      undefined {
        const content = ts.sys.readFile(absPath, encoding);
        if (content === undefined) {
          return undefined;
        }
        if (absPath === APP_COMPONENT || absPath === PARSING_CASES || absPath === TEST_TEMPLATE) {
          return removeReferenceMarkers(removeLocationMarkers(content));
        }
        return content;
      },
  watchFile(path: string, callback: ts.FileWatcherCallback): ts.FileWatcher {
    return NOOP_FILE_WATCHER;
  },
  watchDirectory(path: string, callback: ts.DirectoryWatcherCallback): ts.FileWatcher {
    return NOOP_FILE_WATCHER;
  },
  setTimeout() {
    throw new Error('setTimeout is not implemented');
  },
  clearTimeout() {
    throw new Error('clearTimeout is not implemented');
  },
  setImmediate() {
    throw new Error('setImmediate is not implemented');
  },
  clearImmediate() {
    throw new Error('clearImmediate is not implemented');
  },
};

/**
 * Create a ConfiguredProject and an actual program for the test project located
 * in packages/language-service/test/project. Project creation exercises the
 * actual code path, but a mock host is used for the filesystem to intercept
 * and modify test files.
 */
export function setup() {
  const projectService = new ts.server.ProjectService({
    host,
    logger,
    cancellationToken: ts.server.nullCancellationToken,
    useSingleInferredProject: true,
    useInferredProjectPerProjectRoot: true,
    typingsInstaller: ts.server.nullTypingsInstaller,
  });
  // Opening APP_COMPONENT forces a new ConfiguredProject to be created based
  // on the tsconfig.json in the test project.
  projectService.openClientFile(APP_COMPONENT);
  const project = projectService.findProject(TSCONFIG);
  if (!project) {
    throw new Error(`Failed to create project for ${TSCONFIG}`);
  }
  // The following operation forces a ts.Program to be created.
  const tsLS = project.getLanguageService();
  return {
    service: new MockService(project, projectService),
    project,
    tsLS,
  };
}

interface OverwriteResult {
  /**
   * Position of the cursor, -1 if there isn't one.
   */
  position: number;
  /**
   * Overwritten content without the cursor.
   */
  text: string;
}

class MockService {
  private readonly overwritten = new Set<ts.server.NormalizedPath>();

  constructor(
      private readonly project: ts.server.Project,
      private readonly ps: ts.server.ProjectService,
  ) {}

  /**
   * Overwrite the entire content of `fileName` with `newText`. If cursor is
   * present in `newText`, it will be removed and the position of the cursor
   * will be returned.
   */
  overwrite(fileName: string, newText: string): OverwriteResult {
    const scriptInfo = this.getScriptInfo(fileName);
    return this.overwriteScriptInfo(scriptInfo, newText);
  }

  /**
   * Overwrite an inline template defined in `fileName` and return the entire
   * content of the source file (not just the template). If a cursor is present
   * in `newTemplate`, it will be removed and the position of the cursor in the
   * source file will be returned.
   */
  overwriteInlineTemplate(fileName: string, newTemplate: string): OverwriteResult {
    const scriptInfo = this.getScriptInfo(fileName);
    const snapshot = scriptInfo.getSnapshot();
    const originalText = snapshot.getText(0, snapshot.getLength());
    const {position, text} =
        replaceOnce(originalText, /template: `([\s\S]+?)`/, `template: \`${newTemplate}\``);
    if (position === -1) {
      throw new Error(`${fileName} does not contain a component with template`);
    }
    return this.overwriteScriptInfo(scriptInfo, text);
  }

  reset() {
    if (this.overwritten.size === 0) {
      return;
    }
    for (const fileName of this.overwritten) {
      const scriptInfo = this.getScriptInfo(fileName);
      const reloaded = scriptInfo.reloadFromFile();
      if (!reloaded) {
        throw new Error(`Failed to reload ${scriptInfo.fileName}`);
      }
    }
    this.overwritten.clear();
  }

  getScriptInfo(fileName: string): ts.server.ScriptInfo {
    const scriptInfo = this.ps.getScriptInfo(fileName);
    if (!scriptInfo) {
      throw new Error(`No existing script info for ${fileName}`);
    }
    return scriptInfo;
  }

  /**
   * Remove the cursor from `newText`, then replace `scriptInfo` with the new
   * content and return the position of the cursor.
   * @param scriptInfo
   * @param newText Text that possibly contains a cursor
   */
  private overwriteScriptInfo(scriptInfo: ts.server.ScriptInfo, newText: string): OverwriteResult {
    const result = replaceOnce(newText, /¦/, '');
    const snapshot = scriptInfo.getSnapshot();
    scriptInfo.editContent(0, snapshot.getLength(), result.text);
    this.overwritten.add(scriptInfo.fileName);
    return result;
  }
}

/**
 * Replace at most one occurence that matches `regex` in the specified
 * `searchText` with the specified `replaceText`. Throw an error if there is
 * more than one occurrence.
 */
function replaceOnce(searchText: string, regex: RegExp, replaceText: string): OverwriteResult {
  regex = new RegExp(regex.source, regex.flags + 'g' /* global */);
  let position = -1;
  const text = searchText.replace(regex, (...args) => {
    if (position !== -1) {
      throw new Error(`${regex} matches more than one occurrence in text: ${searchText}`);
    }
    position = args[args.length - 2];  // second last argument is always the index
    return replaceText;
  });
  return {position, text};
}

const REF_MARKER = /«(((\w|\-)+)|([^ᐱ]*ᐱ(\w+)ᐱ.[^»]*))»/g;
const LOC_MARKER = /\~\{(\w+(-\w+)*)\}/g;

function removeReferenceMarkers(value: string): string {
  return value.replace(REF_MARKER, '');
}

function removeLocationMarkers(value: string): string {
  return value.replace(LOC_MARKER, '');
}
