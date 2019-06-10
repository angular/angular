/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceFile, ParseSpan} from '@angular/compiler';
import * as ts from 'typescript';

/**
 * Describes the kind of identifier found in a template.
 */
export enum IdentifierKind {
}

/**
 * Describes a semantically-interesting identifier in a template, such as an interpolated variable
 * or selector.
 */
export interface TemplateIdentifier {
  name: string;
  span: ParseSpan;
  kind: IdentifierKind;
  file: ParseSourceFile;
}

/**
 * Describes an analyzed, indexed component and its template.
 */
export interface IndexedComponent {
  name: string;
  selector: string|null;
  sourceFile: string;
  content: string;
  template: {
    identifiers: Set<TemplateIdentifier>,
    usedComponents: Set<ts.ClassDeclaration>,
  };
}
