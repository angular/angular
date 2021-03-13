/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../output/output_ast';
import {R3ClassMetadata} from '../r3_class_metadata_compiler';
import {Identifiers as R3} from '../r3_identifiers';
import {DefinitionMap} from '../view/util';

import {R3DeclareClassMetadata} from './api';

export function compileDeclareClassMetadata(metadata: R3ClassMetadata): o.Expression {
  const definitionMap = new DefinitionMap<R3DeclareClassMetadata>();
  definitionMap.set('version', o.literal('0.0.0-PLACEHOLDER'));
  definitionMap.set('ngImport', o.importExpr(R3.core));
  definitionMap.set('type', metadata.type);
  definitionMap.set('decorators', metadata.decorators);
  definitionMap.set('ctorParameters', metadata.ctorParameters);
  definitionMap.set('propDecorators', metadata.propDecorators);

  return o.importExpr(R3.declareClassMetadata).callFn([definitionMap.toLiteralMap()]);
}
