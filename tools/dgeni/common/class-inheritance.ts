// tslint:disable:no-bitwise

import {ClassExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassExportDoc';
import {ClassLikeExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassLikeExportDoc';
import {InterfaceExportDoc} from 'dgeni-packages/typescript/api-doc-types/InterfaceExportDoc';
import * as ts from 'typescript';

/** Gets all class like export documents which the given doc inherits from. */
export function getInheritedDocsOfClass(
    doc: ClassLikeExportDoc,
    exportSymbolsToDocsMap: Map<ts.Symbol, ClassLikeExportDoc>): ClassLikeExportDoc[] {
  const result: ClassLikeExportDoc[] = [];
  const typeChecker = doc.typeChecker;
  for (let info of doc.extendsClauses) {
    if (info.doc) {
      result.push(info.doc, ...getInheritedDocsOfClass(info.doc, exportSymbolsToDocsMap));
    } else if (info.type) {
      // If the heritage info has not been resolved to a Dgeni API document, we try to
      // interpret the type expression and resolve/create corresponding Dgeni API documents.
      // An example is the use of mixins. Type-wise mixins are not like real classes, because
      // they are composed through an intersection type. In order to handle this pattern, we
      // need to handle intersection types manually and resolve them to Dgeni API documents.
      const resolvedType = typeChecker.getTypeAtLocation(info.type);
      const docs = getClassLikeDocsFromType(resolvedType, doc, exportSymbolsToDocsMap);
      // Add direct class-like types resolved from the expression.
      result.push(...docs);
      // Resolve inherited docs of the resolved documents.
      docs.forEach(d => result.push(...getInheritedDocsOfClass(d, exportSymbolsToDocsMap)));
    }
  }
  return result;
}

/**
 * Gets all class-like Dgeni documents from the given type. e.g. intersection types of
 * multiple classes will result in multiple Dgeni API documents for each class.
 */
function getClassLikeDocsFromType(
    type: ts.Type, baseDoc: ClassLikeExportDoc,
    exportSymbolsToDocsMap: Map<ts.Symbol, ClassLikeExportDoc>): ClassLikeExportDoc[] {
  let aliasSymbol: ts.Symbol|undefined = undefined;
  let symbol: ts.Symbol = type.symbol;
  const typeChecker = baseDoc.typeChecker;

  // Symbols can be aliases of the declaration symbol. e.g. in named import
  // specifiers. We need to resolve the aliased symbol back to the declaration symbol.
  if (symbol && (symbol.flags & ts.SymbolFlags.Alias) !== 0) {
    aliasSymbol = symbol;
    symbol = typeChecker.getAliasedSymbol(symbol);
  }

  // Intersection types are commonly used in TypeScript mixins to express the
  // class augmentation. e.g. "BaseClass & CanColor".
  if (type.isIntersection()) {
    return type.types.reduce(
        (res, t) => [...res, ...getClassLikeDocsFromType(t, baseDoc, exportSymbolsToDocsMap)],
        [] as ClassLikeExportDoc[]);
  } else if (symbol) {
    // If the given symbol has already been registered within Dgeni, we use the
    // existing symbol instead of creating a new one. The dgeni typescript package
    // keeps track of all exported symbols and their corresponding docs. See:
    // dgeni-packages/blob/master/typescript/src/processors/linkInheritedDocs.ts
    if (exportSymbolsToDocsMap.has(symbol)) {
      return [exportSymbolsToDocsMap.get(symbol)!];
    }
    let createdDoc: ClassLikeExportDoc|null = null;
    if ((symbol.flags & ts.SymbolFlags.Class) !== 0) {
      createdDoc = new ClassExportDoc(baseDoc.host, baseDoc.moduleDoc, symbol, aliasSymbol);
    } else if ((symbol.flags & ts.SymbolFlags.Interface) !== 0) {
      createdDoc = new InterfaceExportDoc(baseDoc.host, baseDoc.moduleDoc, symbol, aliasSymbol);
    }
    // If a new document has been created, add it to the shared symbol
    // docs map and return it.
    if (createdDoc) {
      exportSymbolsToDocsMap.set(aliasSymbol || symbol, createdDoc);
      return [createdDoc];
    }
  }
  return [];
}
