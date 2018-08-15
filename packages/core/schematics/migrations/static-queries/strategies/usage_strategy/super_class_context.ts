/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {isFunctionLikeDeclaration} from '../../../../utils/typescript/functions';
import {hasModifier} from '../../../../utils/typescript/nodes';
import {getPropertyNameText} from '../../../../utils/typescript/property_name';
import {ClassMetadataMap} from '../../angular/ng_query_visitor';
import {getSuperClassDeclarations} from '../../angular/super_class';

import {FunctionContext} from './declaration_usage_visitor';


/**
 * Updates the specified function context to map abstract super-class class members
 * to their implementation TypeScript nodes. This allows us to run the declaration visitor
 * for the super class with the context of the "baseClass" (e.g. with implemented abstract
 * class members)
 */
export function updateSuperClassAbstractMembersContext(
    baseClass: ts.ClassDeclaration, context: FunctionContext, classMetadataMap: ClassMetadataMap) {
  getSuperClassDeclarations(baseClass, classMetadataMap).forEach(superClassDecl => {
    superClassDecl.members.forEach(superClassMember => {
      if (!superClassMember.name || !hasModifier(superClassMember, ts.SyntaxKind.AbstractKeyword)) {
        return;
      }

      // Find the matching implementation of the abstract declaration from the super class.
      const baseClassImpl = baseClass.members.find(
          baseClassMethod => !!baseClassMethod.name &&
              getPropertyNameText(baseClassMethod.name) ===
                  getPropertyNameText(superClassMember.name!));

      if (!baseClassImpl || !isFunctionLikeDeclaration(baseClassImpl) || !baseClassImpl.body) {
        return;
      }

      if (!context.has(superClassMember)) {
        context.set(superClassMember, baseClassImpl);
      }
    });
  });
}
