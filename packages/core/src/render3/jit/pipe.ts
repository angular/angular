/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, WrappedNodeExpr, compilePipeFromMetadata, jitExpression} from '@angular/compiler';

import {Pipe} from '../../metadata/directives';
import {Type} from '../../type';
import {stringify} from '../util';

import {angularCoreEnv} from './environment';
import {NG_PIPE_DEF} from './fields';
import {reflectDependencies} from './util';

export function compilePipe(type: Type<any>, meta: Pipe): void {
  let def: any = null;
  Object.defineProperty(type, NG_PIPE_DEF, {
    get: () => {
      if (def === null) {
        const sourceMapUrl = `ng://${stringify(type)}/ngPipeDef.js`;

        const name = type.name;
        const res = compilePipeFromMetadata({
          name,
          type: new WrappedNodeExpr(type),
          deps: reflectDependencies(type),
          pipeName: meta.name,
          pure: meta.pure !== undefined ? meta.pure : true,
        });

        def = jitExpression(res.expression, angularCoreEnv, sourceMapUrl);
      }
      return def;
    }
  });
}
