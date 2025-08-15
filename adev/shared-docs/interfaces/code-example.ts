/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '@angular/core';
import {SafeHtml} from '@angular/platform-browser';

/**
 * Map of the examples, values are functions which returns the promise of the component type, which will be displayed as preview in the ExampleViewer component
 */
export interface CodeExamplesMap {
  [id: string]: () => Promise<Type<unknown>>;
}

export interface Snippet {
  /** Title of the code snippet */
  title?: string;
  /** Name of the file. */
  name: string;
  /** Content of code snippet */
  sanitizedContent: SafeHtml;
  /** Text in following format `start-end`. Start and end are numbers, based on them provided range of lines will be displayed in collapsed mode  */
  visibleLinesRange?: string;
}

export interface ExampleMetadata {
  /** Numeric id of example, used to generate unique link to the example */
  id: number;
  /** Title of the example. */
  title?: string;
  /** Path to the preview component */
  path?: string;
  /** List of files which are part of the example. */
  files: Snippet[];
  /** True when ExampleViewer should have preview */
  preview: boolean;
}
