/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {TemplateId} from '../api';
import {getTemplateId} from '../diagnostics';
import {TemplateNodeResolver} from './tcb_util';

/**
 * Assigns IDs to templates and keeps track of their origins.
 *
 * Implements `TemplateSourceResolver` to resolve the source of a template based on these IDs.
 */
export class TemplateNodeManager implements TemplateNodeResolver {
  private templateNodes = new Map<TemplateId, ts.ClassDeclaration>();

  getTemplateId(node: ts.ClassDeclaration): TemplateId {
    return getTemplateId(node);
  }

  captureSource(node: ts.ClassDeclaration): TemplateId {
    const id = getTemplateId(node);
    this.templateNodes.set(id, node);
    return id;
  }

  getTemplateNode(id: TemplateId): ts.ClassDeclaration|null {
    if (!this.templateNodes.has(id)) {
      return null;
    }

    return this.templateNodes.get(id)!;
  }
}
