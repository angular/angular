import {DocCollection, Processor} from 'dgeni';
import {ApiDoc} from 'dgeni-packages/typescript/api-doc-types/ApiDoc';
import {FunctionExportDoc} from 'dgeni-packages/typescript/api-doc-types/FunctionExportDoc';
import {MethodMemberDoc} from 'dgeni-packages/typescript/api-doc-types/MethodMemberDoc';

import ts from 'typescript';

/** Type describing a function-like API doc (i.e. a function, or a class method member). */
type FunctionLikeDoc = (FunctionExportDoc | MethodMemberDoc) & {
  returns?: {description: string};
  isAsync?: boolean;
};

/**
 * Processor that marks documents for functions which are asynchronous. Additionally, the
 * processor automatically sets the @return description for asynchronous methods which do
 * not return any value.
 */
export class AsyncFunctionsProcessor implements Processor {
  name = 'async-functions';
  $runBefore = ['categorizer'];

  $process(docs: DocCollection) {
    docs.forEach((doc: ApiDoc) => {
      if (!isFunctionLikeDoc(doc)) {
        return;
      }
      const typeString = getTypeOfFunctionLikeDoc(doc);

      // Mark asynchronous function API documents. Async functions can be detected
      // in multiple ways. Most commonly by checking the type symbol name and ensuring
      // there is a type argument, or by just checking the stringified type. For simplicity,
      // we just check the stringified type.
      if (typeString && typeString.startsWith('Promise<')) {
        doc.isAsync = true;
      }

      // Add a JSDoc @returns description for void asynchronous functions.
      if (!doc.returns && typeString === 'Promise<void>') {
        doc.returns = {description: 'Promise that resolves when the action completes.'};
      }
    });
  }
}

/**
 * Gets the type of the function-like doc. If no explicit type has been specified,
 * the type checker is used to compute a type string based on the function body.
 */
function getTypeOfFunctionLikeDoc(doc: FunctionLikeDoc): string | null {
  if (doc.type) {
    return doc.type;
  }

  const decl = doc.declaration as ts.MethodDeclaration | ts.FunctionDeclaration;
  const signature = doc.typeChecker.getSignatureFromDeclaration(decl);

  if (!signature) {
    return null;
  }

  const returnType = doc.typeChecker.getReturnTypeOfSignature(signature);
  return doc.typeChecker.typeToString(returnType);
}

/** Whether the given API doc is a function-like doc. */
function isFunctionLikeDoc(doc: ApiDoc): doc is FunctionLikeDoc {
  return doc instanceof FunctionExportDoc || doc instanceof MethodMemberDoc;
}
