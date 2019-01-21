/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Closure compiler transforms the form `Service.ngInjectableDef = X` into
// `Service$ngInjectableDef = X`. To prevent this transformation, such assignments need to be
// annotated with @nocollapse. Unfortunately, a bug in Typescript where comments aren't propagated
// through the TS transformations precludes adding the comment via the AST. This workaround detects
// the static assignments to R3 properties such as ngInjectableDef using a regex, as output files
// are written, and applies the annotation through regex replacement.
//
// TODO(alxhub): clean up once fix for TS transformers lands in upstream
//
// Typescript reference issue: https://github.com/Microsoft/TypeScript/issues/22497

// Pattern matching all Render3 property names.
const R3_DEF_NAME_PATTERN = [
  'ngBaseDef',
  'ngComponentDef',
  'ngDirectiveDef',
  'ngInjectableDef',
  'ngInjectorDef',
  'ngModuleDef',
  'ngPipeDef',
].join('|');

// Pattern matching `Identifier.property` where property is a Render3 property.
const R3_DEF_ACCESS_PATTERN = `[^\\s\\.()[\\]]+\.(${R3_DEF_NAME_PATTERN})`;

// Pattern matching a source line that contains a Render3 static property assignment.
// It declares two matching groups - one for the preceding whitespace, the second for the rest
// of the assignment expression.
const R3_DEF_LINE_PATTERN = `^(\\s*)(${R3_DEF_ACCESS_PATTERN} = .*)$`;

// Regex compilation of R3_DEF_LINE_PATTERN. Matching group 1 yields the whitespace preceding the
// assignment, matching group 2 gives the rest of the assignment expressions.
const R3_MATCH_DEFS = new RegExp(R3_DEF_LINE_PATTERN, 'gmu');

const R3_TSICKLE_DECL_PATTERN =
    `(\\/\\*\\*[*\\s]*)(@[^*]+\\*\\/\\s+[^.]+\\.(?:${R3_DEF_NAME_PATTERN});)`;

const R3_MATCH_TSICKLE_DECL = new RegExp(R3_TSICKLE_DECL_PATTERN, 'gmu');

// Replacement string that complements R3_MATCH_DEFS. It inserts `/** @nocollapse */` before the
// assignment but after any indentation. Note that this will mess up any sourcemaps on this line
// (though there shouldn't be any, since Render3 properties are synthetic).
const R3_NOCOLLAPSE_DEFS = '$1\/** @nocollapse *\/ $2';

const R3_NOCOLLAPSE_TSICKLE_DECL = '$1@nocollapse $2';

export function nocollapseHack(contents: string): string {
  return contents.replace(R3_MATCH_DEFS, R3_NOCOLLAPSE_DEFS)
      .replace(R3_MATCH_TSICKLE_DECL, R3_NOCOLLAPSE_TSICKLE_DECL);
}
