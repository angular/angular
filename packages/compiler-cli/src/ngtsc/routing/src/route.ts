/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ModuleResolver} from '../../imports';

export abstract class RouterEntryPoint {
  abstract readonly filePath: string;

  abstract readonly moduleName: string;

  // Alias of moduleName.
  abstract readonly name: string;

  abstract toString(): string;
}

class RouterEntryPointImpl implements RouterEntryPoint {
  constructor(readonly filePath: string, readonly moduleName: string) {}

  get name(): string { return this.moduleName; }

  toString(): string { return `${this.filePath}#${this.moduleName}`; }
}

export class RouterEntryPointManager {
  private map = new Map<string, RouterEntryPoint>();

  constructor(private moduleResolver: ModuleResolver) {}

  resolveLoadChildrenIdentifier(loadChildrenIdentifier: string, context: ts.SourceFile):
      RouterEntryPoint|null {
    const [relativeFile, moduleName] = loadChildrenIdentifier.split('#');
    if (moduleName === undefined) {
      return null;
    }
    const resolvedSf = this.moduleResolver.resolveModuleName(relativeFile, context);
    if (resolvedSf === null) {
      return null;
    }
    return this.fromNgModule(resolvedSf, moduleName);
  }

  fromNgModule(sf: ts.SourceFile, moduleName: string): RouterEntryPoint {
    const absoluteFile = sf.fileName;
    const key = `${absoluteFile}#${moduleName}`;
    if (!this.map.has(key)) {
      this.map.set(key, new RouterEntryPointImpl(absoluteFile, moduleName));
    }
    return this.map.get(key) !;
  }
}
