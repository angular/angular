/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** A custom element class for `customElementsManifest`. */
export interface TestCustomElement {
  tagName: string;
  /** The class name. Defaults to the tag name in PascalCase, such as `MyButton`. */
  name?: string;
  /** The module path. Defaults to the tag name with a `.js` extension. */
  path?: string;
  /** Exports of the module, such as `js` exports of the class. */
  exports?: unknown[];
  /** Other fields of the class declaration, such as `members`, `attributes`, and `events`. */
  [field: string]: unknown;
}

/**
 * Builds a schema v1 Custom Elements Manifest that declares each element as a class in its own
 * module.
 */
export function customElementsManifest(...elements: TestCustomElement[]): {
  schemaVersion: string;
  modules: unknown[];
} {
  return {
    schemaVersion: '1.0.0',
    modules: elements.map(({tagName, name, path, exports, ...fields}) => ({
      kind: 'javascript-module',
      path: path ?? `${tagName}.js`,
      declarations: [
        {
          kind: 'class',
          name: name ?? tagName.replace(/(?:^|-)([a-z])/g, (_, char: string) => char.toUpperCase()),
          customElement: true,
          tagName,
          ...fields,
        },
      ],
      ...(exports === undefined ? {} : {exports}),
    })),
  };
}
