/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {ParsedFile} from './parsed_file';

/**
 * Classes that implement this interface can parse a file in a package to
 * find the "declarations" (representing exported classes), that are decorated with core
 * decorators, such as `@Component`, `@Injectable`, etc.
 *
 * Identifying classes can be different depending upon the format of the source file.
 *
 * For example:
 *
 * - ES2015 files contain `class Xxxx {...}` style declarations
 * - ES5 files contain `var Xxxx = (function () { function Xxxx() { ... }; return Xxxx; })();` style
 *   declarations
 * - UMD have similar declarations to ES5 files but the whole thing is wrapped in IIFE module
 * wrapper
 *   function.
 */
export interface FileParser {
  /**
   * Parse a file to identify the decorated classes.
   *
   * @param file The the entry point file for identifying classes to process.
   * @returns A `ParsedFiles` collection that holds the decorated classes and import information.
   */
  parseFile(file: ts.SourceFile): ParsedFile[];
}
