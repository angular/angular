/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EntryType, FunctionEntry, ParameterEntry} from '@angular/compiler-cli/src/ngtsc/docs/src/entities';
import {extractJsDocDescription, extractJsDocTags, extractRawJsDoc} from '@angular/compiler-cli/src/ngtsc/docs/src/jsdoc_extractor';
import ts from 'typescript';

import {extractResolvedTypeString} from './type_extractor';

export class FunctionExtractor {
  constructor(
      private declaration: ts.FunctionDeclaration|ts.MethodDeclaration|ts.MethodSignature,
      private typeChecker: ts.TypeChecker,
  ) {}

  extract(): FunctionEntry {
    // TODO: is there any real situation in which the signature would not be available here?
    //     Is void a better type?
    const signature = this.typeChecker.getSignatureFromDeclaration(this.declaration);
    const returnType = signature ?
        this.typeChecker.typeToString(this.typeChecker.getReturnTypeOfSignature(signature)) :
        'unknown';

    return {
      params: this.extractAllParams(this.declaration.parameters),
      // We know that the function has a name here because we would have skipped it
      // already before getting to this point if it was anonymous.
      name: this.declaration.name!.getText(),
      returnType,
      entryType: EntryType.Function,
      description: extractJsDocDescription(this.declaration),
      jsdocTags: extractJsDocTags(this.declaration),
      rawComment: extractRawJsDoc(this.declaration),
    };
  }

  private extractAllParams(params: ts.NodeArray<ts.ParameterDeclaration>): ParameterEntry[] {
    return params.map(param => ({
                        name: param.name.getText(),
                        description: extractJsDocDescription(param),
                        type: extractResolvedTypeString(param, this.typeChecker),
                        isOptional: !!(param.questionToken || param.initializer),
                        isRestParam: !!param.dotDotDotToken,
                      }));
  }
}
