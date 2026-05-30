/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {GenericEntry} from './entities';

type DeclarationWithTypeParams = {
  typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration> | undefined;
};

/** Gets a list of all the generic type parameters for a declaration. */
export function extractGenerics(declaration: DeclarationWithTypeParams): GenericEntry[] {
  return (
    declaration.typeParameters?.map((typeParam) => ({
      name: typeParam.name.getText(),
      constraint: typeParam.constraint?.getText(),
      default: typeParam.default?.getText(),
    })) ?? []
  );
}
