/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  compileOpaqueAsyncClassMetadata,
  ConstantPool,
  R3ClassMetadata,
  R3DeclareClassMetadataAsync,
} from '@angular/compiler';

import {AstObject, AstValue} from '../../ast/ast_value';
import {FatalLinkerError} from '../../fatal_linker_error';

import {LinkedDefinition, PartialLinker} from './partial_linker';

/**
 * A `PartialLinker` that is designed to process `ɵɵngDeclareClassMetadataAsync()` call expressions.
 */
export class PartialClassMetadataAsyncLinkerVersion1<TExpression>
  implements PartialLinker<TExpression>
{
  linkPartialDeclaration(
    constantPool: ConstantPool,
    metaObj: AstObject<R3DeclareClassMetadataAsync, TExpression>,
  ): LinkedDefinition {
    const resolveMetadataKey = 'resolveMetadata';
    const resolveMetadata = metaObj.getValue(resolveMetadataKey) as unknown as AstValue<
      Function,
      TExpression
    >;

    if (!resolveMetadata.isFunction()) {
      throw new FatalLinkerError(
        resolveMetadata,
        `Unsupported \`${resolveMetadataKey}\` value. Expected a function.`,
      );
    }

    const dependencyResolverFunction = metaObj.getOpaque('resolveDeferredDeps');
    const deferredSymbolNames = resolveMetadata
      .getFunctionParameters()
      .map((p) => p.getSymbolName()!);
    const returnValue = resolveMetadata.getFunctionReturnValue<R3ClassMetadata>().getObject();
    const metadata: R3ClassMetadata = {
      type: metaObj.getOpaque('type'),
      decorators: returnValue.getOpaque('decorators'),
      ctorParameters: returnValue.getOpaque('ctorParameters'),
      propDecorators: returnValue.getOpaque('propDecorators'),
    };

    return {
      expression: compileOpaqueAsyncClassMetadata(
        metadata,
        dependencyResolverFunction,
        deferredSymbolNames,
      ),
      statements: [],
    };
  }
}
