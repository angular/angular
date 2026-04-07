/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {DeclarationNode} from '../../../reflection';

import {TypeCheckId} from '../../api';

const TYPE_CHECK_ID_MAP = Symbol('TypeCheckId');

interface HasNextTypeCheckId {
  [TYPE_CHECK_ID_MAP]: Map<ts.Node, TypeCheckId>;
}

export function getTypeCheckId(clazz: DeclarationNode): TypeCheckId {
  const sf = clazz.getSourceFile() as ts.SourceFile & Partial<HasNextTypeCheckId>;
  if (sf[TYPE_CHECK_ID_MAP] === undefined) {
    sf[TYPE_CHECK_ID_MAP] = new Map();
  }
  if (sf[TYPE_CHECK_ID_MAP].get(clazz) === undefined) {
    sf[TYPE_CHECK_ID_MAP].set(clazz, `tcb${sf[TYPE_CHECK_ID_MAP].size + 1}` as TypeCheckId);
  }
  return sf[TYPE_CHECK_ID_MAP].get(clazz)!;
}
