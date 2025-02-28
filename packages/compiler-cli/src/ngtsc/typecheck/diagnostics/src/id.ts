/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {DeclarationNode} from '../../../reflection';

import {TemplateId} from '../../api';

const TEMPLATE_ID_MAP = Symbol('ngTemplateId');

interface HasNextTemplateId {
  [TEMPLATE_ID_MAP]: Map<ts.Node, TemplateId>;
}

export function getTemplateId(clazz: DeclarationNode): TemplateId {
  const sf = clazz.getSourceFile() as ts.SourceFile & Partial<HasNextTemplateId>;
  if (sf[TEMPLATE_ID_MAP] === undefined) {
    sf[TEMPLATE_ID_MAP] = new Map();
  }
  if (sf[TEMPLATE_ID_MAP].get(clazz) === undefined) {
    sf[TEMPLATE_ID_MAP].set(clazz, `tcb${sf[TEMPLATE_ID_MAP].size + 1}` as TemplateId);
  }
  return sf[TEMPLATE_ID_MAP].get(clazz)!;
}
