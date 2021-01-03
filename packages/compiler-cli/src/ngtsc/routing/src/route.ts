/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ModuleResolver} from '../../imports';

export abstract class RouterEntryPoint {
  abstract readonly filePath: string;

  abstract readonly moduleName: string;

  // Alias of moduleName for compatibility with what `ngtools_api` returned.
  abstract readonly name: string;
}

class RouterEntryPointImpl implements RouterEntryPoint {
  constructor(readonly filePath: string, readonly moduleName: string) {}

  get name(): string {
    return this.moduleName;
  }

  // For debugging purposes.
  toString(): string {
    return `RouterEntryPoint(name: ${this.name}, filePath: ${this.filePath})`;
  }
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
    const resolvedSf = this.moduleResolver.resolveModule(relativeFile, context.fileName);
    if (resolvedSf === null) {
      return null;
    }
    return this.fromNgModule(resolvedSf, moduleName);
  }

  fromNgModule(sf: ts.SourceFile, moduleName: string): RouterEntryPoint {
    const key = entryPointKeyFor(sf.fileName, moduleName);
    if (!this.map.has(key)) {
      this.map.set(key, new RouterEntryPointImpl(sf.fileName, moduleName));
    }
    return this.map.get(key)!;
  }
}

export function entryPointKeyFor(filePath: string, moduleName: string): string {
  // Drop the extension to be compatible with how cli calls `listLazyRoutes(entryRoute)`.
  return `${filePath.replace(/\.tsx?$/i, '')}#${moduleName}`;
}
