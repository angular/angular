/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileNgModuleMetadata, NgAnalyzedModules} from '@angular/compiler';
import {setup} from '@angular/compiler-cli/test/test_support';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {Span} from '../src/types';

const angularts = /@angular\/(\w|\/|-)+\.tsx?$/;
const rxjsts = /rxjs\/(\w|\/)+\.tsx?$/;
const rxjsmetadata = /rxjs\/(\w|\/)+\.metadata\.json?$/;
const tsxfile = /\.tsx$/;

/* The missing cache does two things. First it improves performance of the
   tests as it reduces the number of OS calls made during testing. Also it
   improves debugging experience as fewer exceptions are raised to allow you
   to use stopping on all exceptions. */
const missingCache = new Set<string>([
  '/node_modules/@angular/core.d.ts',
  '/node_modules/@angular/animations.d.ts',
  '/node_modules/@angular/platform-browser/animations.d.ts',
  '/node_modules/@angular/common.d.ts',
  '/node_modules/@angular/forms.d.ts',
  '/node_modules/@angular/core/src/di/provider.metadata.json',
  '/node_modules/@angular/core/src/change_detection/pipe_transform.metadata.json',
  '/node_modules/@angular/core/src/reflection/types.metadata.json',
  '/node_modules/@angular/core/src/reflection/platform_reflection_capabilities.metadata.json',
  '/node_modules/@angular/forms/src/directives/form_interface.metadata.json',
]);

function isFile(path: string) {
  return fs.statSync(path).isFile();
}

/**
 * Return a Map with key = directory / file path, value = file content.
 * [
 *   /app => [[directory]]
 *   /app/main.ts => ...
 *   /app/app.component.ts => ...
 *   /app/expression-cases.ts => ...
 *   /app/ng-for-cases.ts => ...
 *   /app/ng-if-cases.ts => ...
 *   /app/parsing-cases.ts => ...
 *   /app/test.css => ...
 *   /app/test.ng => ...
 * ]
 */
function loadTourOfHeroes(): ReadonlyMap<string, string> {
  const {TEST_SRCDIR} = process.env;
  const root =
      path.join(TEST_SRCDIR!, 'angular', 'packages', 'language-service', 'test', 'project');
  const dirs = [root];
  const files = new Map<string, string>();
  while (dirs.length) {
    const dirPath = dirs.pop()!;
    for (const filePath of fs.readdirSync(dirPath)) {
      const absPath = path.join(dirPath, filePath);
      if (isFile(absPath)) {
        const key = path.join('/', path.relative(root, absPath));
        const value = fs.readFileSync(absPath, 'utf8');
        files.set(key, value);
      } else {
        const key = path.join('/', path.relative(root, absPath));
        files.set(key, '[[directory]]');
        dirs.push(absPath);
      }
    }
  }
  return files;
}

const TOH = loadTourOfHeroes();
const COMPILER_OPTIONS: Readonly<ts.CompilerOptions> = {
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  removeComments: false,
  noImplicitAny: false,
  lib: ['lib.es2015.d.ts', 'lib.dom.d.ts'],
  strict: true,
};

export class MockTypescriptHost implements ts.LanguageServiceHost {
  private readonly angularPath: string;
  private readonly nodeModulesPath: string;
  private readonly scriptVersion = new Map<string, number>();
  private readonly overrides = new Map<string, string>();
  private projectVersion = 0;
  private options: ts.CompilerOptions;
  private readonly overrideDirectory = new Set<string>();
  private readonly existsCache = new Map<string, boolean>();
  private readonly fileCache = new Map<string, string|undefined>();
  errors: string[] = [];

  constructor(
      private readonly scriptNames: string[],
      private readonly node_modules: string = 'node_modules',
      private readonly myPath: typeof path = path) {
    const support = setup();
    this.nodeModulesPath = path.posix.join(support.basePath, 'node_modules');
    this.angularPath = path.posix.join(this.nodeModulesPath, '@angular');
    this.options = COMPILER_OPTIONS;
  }

  override(fileName: string, content: string) {
    this.scriptVersion.set(fileName, (this.scriptVersion.get(fileName) || 0) + 1);
    this.projectVersion++;
    if (content) {
      this.overrides.set(fileName, content);
      this.overrideDirectory.add(path.dirname(fileName));
    } else {
      this.overrides.delete(fileName);
    }
    return content;
  }

  /**
   * Override the inline template in `fileName`.
   * @param fileName path to component that has inline template
   * @param content new template
   *
   * @return the new content of the file
   */
  overrideInlineTemplate(fileName: string, content: string): string {
    const originalContent = this.getRawFileContent(fileName)!;
    const newContent =
        originalContent.replace(/template: `([\s\S]+?)`/, `template: \`${content}\``);
    return this.override(fileName, newContent);
  }

  addScript(fileName: string, content: string) {
    if (this.scriptVersion.has(fileName)) {
      throw new Error(`${fileName} is already in the root files.`);
    }
    this.scriptVersion.set(fileName, 0);
    this.projectVersion++;
    this.overrides.set(fileName, content);
    this.overrideDirectory.add(path.dirname(fileName));
    this.scriptNames.push(fileName);
  }

  overrideOptions(options: Partial<ts.CompilerOptions>) {
    this.options = {...this.options, ...options};
    this.projectVersion++;
  }

  getCompilationSettings(): ts.CompilerOptions {
    return {...this.options};
  }

  getProjectVersion(): string {
    return this.projectVersion.toString();
  }

  getScriptFileNames(): string[] {
    return this.scriptNames;
  }

  getScriptVersion(fileName: string): string {
    return (this.scriptVersion.get(fileName) || 0).toString();
  }

  getScriptSnapshot(fileName: string): ts.IScriptSnapshot|undefined {
    const content = this.readFile(fileName);
    if (content) return ts.ScriptSnapshot.fromString(content);
    return undefined;
  }

  getCurrentDirectory(): string {
    return '/';
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return 'lib.d.ts';
  }

  directoryExists(directoryName: string): boolean {
    if (this.overrideDirectory.has(directoryName)) return true;
    const effectiveName = this.getEffectiveName(directoryName);
    if (effectiveName === directoryName) {
      return TOH.get(directoryName) === '[[directory]]';
    }
    if (effectiveName === '/' + this.node_modules) {
      return true;
    }
    return this.pathExists(effectiveName);
  }

  fileExists(fileName: string): boolean {
    return this.getRawFileContent(fileName) != null;
  }

  readFile(fileName: string): string|undefined {
    const content = this.getRawFileContent(fileName);
    if (content) {
      return removeReferenceMarkers(removeLocationMarkers(content));
    }
  }

  /**
   * Reset the project to its original state, effectively removing all overrides.
   */
  reset() {
    // project version and script version must be monotonically increasing,
    // they must not be reset to zero.
    this.projectVersion++;
    for (const fileName of this.overrides.keys()) {
      const version = this.scriptVersion.get(fileName);
      if (version === undefined) {
        throw new Error(`No prior version found for ${fileName}`);
      }
      this.scriptVersion.set(fileName, version + 1);
    }
    // Remove overrides from scriptNames
    let length = 0;
    for (let i = 0; i < this.scriptNames.length; ++i) {
      const fileName = this.scriptNames[i];
      if (!this.overrides.has(fileName)) {
        this.scriptNames[length++] = fileName;
      }
    }
    this.scriptNames.splice(length);
    this.overrides.clear();
    this.overrideDirectory.clear();
    this.options = COMPILER_OPTIONS;
  }

  private getRawFileContent(fileName: string): string|undefined {
    if (this.overrides.has(fileName)) {
      return this.overrides.get(fileName);
    }
    let basename = path.basename(fileName);
    if (/^lib.*\.d\.ts$/.test(basename)) {
      let libPath = ts.getDefaultLibFilePath(this.getCompilationSettings());
      return fs.readFileSync(this.myPath.join(path.dirname(libPath), basename), 'utf8');
    }
    if (missingCache.has(fileName)) {
      return undefined;
    }

    const effectiveName = this.getEffectiveName(fileName);
    if (effectiveName === fileName) {
      return TOH.get(fileName);
    }
    if (!fileName.match(angularts) && !fileName.match(rxjsts) && !fileName.match(rxjsmetadata) &&
        !fileName.match(tsxfile)) {
      if (this.fileCache.has(effectiveName)) {
        return this.fileCache.get(effectiveName);
      } else if (this.pathExists(effectiveName)) {
        const content = fs.readFileSync(effectiveName, 'utf8');
        this.fileCache.set(effectiveName, content);
        return content;
      } else {
        missingCache.add(fileName);
      }
    }
  }

  private pathExists(path: string): boolean {
    if (this.existsCache.has(path)) {
      return this.existsCache.get(path)!;
    }

    const exists = fs.existsSync(path);
    this.existsCache.set(path, exists);
    return exists;
  }

  private getEffectiveName(name: string): string {
    const node_modules = this.node_modules;
    const at_angular = '/@angular';
    if (name.startsWith('/' + node_modules)) {
      if (this.nodeModulesPath && !name.startsWith('/' + node_modules + at_angular)) {
        const result =
            this.myPath.posix.join(this.nodeModulesPath, name.substr(node_modules.length + 1));
        if (!name.match(rxjsts) && this.pathExists(result)) {
          return result;
        }
      }
      if (name.startsWith('/' + node_modules + at_angular)) {
        return this.myPath.posix.join(
            this.angularPath, name.substr(node_modules.length + at_angular.length + 1));
      }
    }
    return name;
  }


  /**
   * Append a snippet of code to `app.component.ts` and return the file name.
   * There must not be any name collision with existing code.
   * @param code Snippet of code
   */
  addCode(code: string) {
    const fileName = '/app/app.component.ts';
    const originalContent = this.readFile(fileName);
    const newContent = originalContent + code;
    this.override(fileName, newContent);
    return fileName;
  }

  /**
   * Returns the definition marker `ᐱselectorᐱ` for the specified 'selector'.
   * Asserts that marker exists.
   * @param fileName name of the file
   * @param selector name of the marker
   */
  getDefinitionMarkerFor(fileName: string, selector: string): ts.TextSpan {
    const content = this.getRawFileContent(fileName);
    if (!content) {
      throw new Error(`File does not exist: ${fileName}`);
    }
    const markers = getReferenceMarkers(content);
    const definitions = markers.definitions[selector];
    if (!definitions || !definitions.length) {
      throw new Error(`Failed to find marker '${selector}' in ${fileName}`);
    }
    if (definitions.length > 1) {
      throw new Error(`Multiple positions found for '${selector}' in ${fileName}`);
    }
    const {start, end} = definitions[0];
    if (start > end) {
      throw new Error(`Marker '${selector}' in ${fileName} is invalid: ${start} > ${end}`);
    }
    return {
      start,
      length: end - start,
    };
  }

  /**
   * Returns the reference marker `«selector»` for the specified 'selector'.
   * Asserts that marker exists.
   * @param fileName name of the file
   * @param selector name of the marker
   */
  getReferenceMarkerFor(fileName: string, selector: string): ts.TextSpan {
    const content = this.getRawFileContent(fileName);
    if (!content) {
      throw new Error(`File does not exist: ${fileName}`);
    }
    const markers = getReferenceMarkers(content);
    const references = markers.references[selector];
    if (!references || !references.length) {
      throw new Error(`Failed to find marker '${selector}' in ${fileName}`);
    }
    if (references.length > 1) {
      throw new Error(`Multiple positions found for '${selector}' in ${fileName}`);
    }
    const {start, end} = references[0];
    if (start > end) {
      throw new Error(`Marker '${selector}' in ${fileName} is invalid: ${start} > ${end}`);
    }
    return {
      start,
      length: end - start,
    };
  }

  /**
   * Returns the location marker `~{selector}` or the marker pair
   * `~{start-selector}` and `~{end-selector}` for the specified 'selector'.
   * Asserts that marker exists.
   * @param fileName name of the file
   * @param selector name of the marker
   */
  getLocationMarkerFor(fileName: string, selector: string): ts.TextSpan {
    const content = this.getRawFileContent(fileName);
    if (!content) {
      throw new Error(`File does not exist: ${fileName}`);
    }
    const markers = getLocationMarkers(content);
    // Look for just the selector itself
    const position = markers[selector];
    if (position !== undefined) {
      return {
        start: position,
        length: 0,
      };
    }
    // Look for start and end markers for the selector
    const start = markers[`start-${selector}`];
    const end = markers[`end-${selector}`];
    if (start !== undefined && end !== undefined) {
      return {
        start,
        length: end - start,
      };
    }
    throw new Error(`Failed to find marker '${selector}' in ${fileName}`);
  }

  error(msg: string) {
    this.errors.push(msg);
  }
}

const locationMarker = /\~\{(\w+(-\w+)*)\}/g;

function removeLocationMarkers(value: string): string {
  return value.replace(locationMarker, '');
}

function getLocationMarkers(value: string): {[name: string]: number} {
  value = removeReferenceMarkers(value);
  let result: {[name: string]: number} = {};
  let adjustment = 0;
  value.replace(locationMarker, (match: string, name: string, _: any, index: number): string => {
    result[name] = index - adjustment;
    adjustment += match.length;
    return '';
  });
  return result;
}

const referenceMarker = /«(((\w|\-)+)|([^ᐱ]*ᐱ(\w+)ᐱ.[^»]*))»/g;

export type ReferenceMarkers = {
  [name: string]: Span[]
};
export interface ReferenceResult {
  text: string;
  definitions: ReferenceMarkers;
  references: ReferenceMarkers;
}

function getReferenceMarkers(value: string): ReferenceResult {
  const references: ReferenceMarkers = {};
  const definitions: ReferenceMarkers = {};
  value = removeLocationMarkers(value);

  let adjustment = 0;
  const text = value.replace(
      referenceMarker,
      (match: string, text: string, reference: string, _: string, definition: string,
       definitionName: string, index: number): string => {
        const result = reference ? text : text.replace(/ᐱ/g, '');
        const span: Span = {start: index - adjustment, end: index - adjustment + result.length};
        const markers = reference ? references : definitions;
        const name = reference || definitionName;
        (markers[name] = (markers[name] || [])).push(span);
        adjustment += match.length - result.length;
        return result;
      });

  return {text, definitions, references};
}

function removeReferenceMarkers(value: string): string {
  return value.replace(referenceMarker, (match, text) => text.replace(/ᐱ/g, ''));
}

/**
 * Find the StaticSymbol that has the specified `directiveName` and return its
 * Angular metadata, if any.
 * @param ngModules analyzed modules
 * @param directiveName
 */
export function findDirectiveMetadataByName(
    ngModules: NgAnalyzedModules, directiveName: string): CompileNgModuleMetadata|undefined {
  for (const [key, value] of ngModules.ngModuleByPipeOrDirective) {
    if (key.name === directiveName) {
      return value;
    }
  }
}
