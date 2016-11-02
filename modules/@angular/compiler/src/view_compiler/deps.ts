/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileIdentifierMetadata} from '../compile_metadata';

export class ViewClassDependency {
  constructor(
      public comp: CompileIdentifierMetadata, public placeholder: CompileIdentifierMetadata) {}
}

export class ComponentFactoryDependency {
  constructor(
      public comp: CompileIdentifierMetadata, public placeholder: CompileIdentifierMetadata) {}
}

export class DirectiveWrapperDependency {
  constructor(
      public dir: CompileIdentifierMetadata, public placeholder: CompileIdentifierMetadata) {}
}
