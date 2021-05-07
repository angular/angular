/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/compiler';
import * as ts from 'typescript';

import {ImportRewriter} from '../../imports';
import {ClassDeclaration} from '../../reflection';
import {ImportManager, translateType} from '../../translator';

import {DtsTransform} from './api';
import {addImports} from './utils';

/**
 * Keeps track of `DtsTransform`s per source file, so that it is known which source files need to
 * have their declaration file transformed.
 */
export class DtsTransformRegistry {
  private ivyDeclarationTransforms = new Map<ts.SourceFile, IvyDeclarationDtsTransform>();

  getIvyDeclarationTransform(sf: ts.SourceFile): IvyDeclarationDtsTransform {
    if (!this.ivyDeclarationTransforms.has(sf)) {
      this.ivyDeclarationTransforms.set(sf, new IvyDeclarationDtsTransform());
    }
    return this.ivyDeclarationTransforms.get(sf)!;
  }

  /**
   * Gets the dts transforms to be applied for the given source file, or `null` if no transform is
   * necessary.
   */
  getAllTransforms(sf: ts.SourceFile): DtsTransform[]|null {
    // No need to transform if it's not a declarations file, or if no changes have been requested
    // to the input file. Due to the way TypeScript afterDeclarations transformers work, the
    // `ts.SourceFile` path is the same as the original .ts. The only way we know it's actually a
    // declaration file is via the `isDeclarationFile` property.
    if (!sf.isDeclarationFile) {
      return null;
    }
    const originalSf = ts.getOriginalNode(sf) as ts.SourceFile;

    let transforms: DtsTransform[]|null = null;
    if (this.ivyDeclarationTransforms.has(originalSf)) {
      transforms = [];
      transforms.push(this.ivyDeclarationTransforms.get(originalSf)!);
    }
    return transforms;
  }
}

export function declarationTransformFactory(
    transformRegistry: DtsTransformRegistry, importRewriter: ImportRewriter,
    importPrefix?: string): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    const transformer = new DtsTransformer(context, importRewriter, importPrefix);
    return (fileOrBundle) => {
      if (ts.isBundle(fileOrBundle)) {
        // Only attempt to transform source files.
        return fileOrBundle;
      }
      const transforms = transformRegistry.getAllTransforms(fileOrBundle);
      if (transforms === null) {
        return fileOrBundle;
      }
      return transformer.transform(fileOrBundle, transforms);
    };
  };
}

/**
 * Processes .d.ts file text and adds static field declarations, with types.
 */
class DtsTransformer {
  constructor(
      private ctx: ts.TransformationContext, private importRewriter: ImportRewriter,
      private importPrefix?: string) {}

  /**
   * Transform the declaration file and add any declarations which were recorded.
   */
  transform(sf: ts.SourceFile, transforms: DtsTransform[]): ts.SourceFile {
    const imports = new ImportManager(this.importRewriter, this.importPrefix);

    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      if (ts.isClassDeclaration(node)) {
        return this.transformClassDeclaration(node, transforms, imports);
      } else if (ts.isFunctionDeclaration(node)) {
        return this.transformFunctionDeclaration(node, transforms, imports);
      } else {
        // Otherwise return node as is.
        return ts.visitEachChild(node, visitor, this.ctx);
      }
    };

    // Recursively scan through the AST and process all nodes as desired.
    sf = ts.visitNode(sf, visitor);

    // Add new imports for this file.
    return addImports(imports, sf);
  }

  private transformClassDeclaration(
      clazz: ts.ClassDeclaration, transforms: DtsTransform[],
      imports: ImportManager): ts.ClassDeclaration {
    let elements: ts.ClassElement[]|ReadonlyArray<ts.ClassElement> = clazz.members;
    let elementsChanged = false;

    for (const transform of transforms) {
      if (transform.transformClassElement !== undefined) {
        for (let i = 0; i < elements.length; i++) {
          const res = transform.transformClassElement(elements[i], imports);
          if (res !== elements[i]) {
            if (!elementsChanged) {
              elements = [...elements];
              elementsChanged = true;
            }
            (elements as ts.ClassElement[])[i] = res;
          }
        }
      }
    }

    let newClazz: ts.ClassDeclaration = clazz;

    for (const transform of transforms) {
      if (transform.transformClass !== undefined) {
        // If no DtsTransform has changed the class yet, then the (possibly mutated) elements have
        // not yet been incorporated. Otherwise, `newClazz.members` holds the latest class members.
        const inputMembers = (clazz === newClazz ? elements : newClazz.members);

        newClazz = transform.transformClass(newClazz, inputMembers, imports);
      }
    }

    // If some elements have been transformed but the class itself has not been transformed, create
    // an updated class declaration with the updated elements.
    if (elementsChanged && clazz === newClazz) {
      newClazz = ts.updateClassDeclaration(
          /* node */ clazz,
          /* decorators */ clazz.decorators,
          /* modifiers */ clazz.modifiers,
          /* name */ clazz.name,
          /* typeParameters */ clazz.typeParameters,
          /* heritageClauses */ clazz.heritageClauses,
          /* members */ elements);
    }

    return newClazz;
  }

  private transformFunctionDeclaration(
      declaration: ts.FunctionDeclaration, transforms: DtsTransform[],
      imports: ImportManager): ts.FunctionDeclaration {
    let newDecl = declaration;

    for (const transform of transforms) {
      if (transform.transformFunctionDeclaration !== undefined) {
        newDecl = transform.transformFunctionDeclaration(newDecl, imports);
      }
    }

    return newDecl;
  }
}

export interface IvyDeclarationField {
  name: string;
  type: Type;
}

export class IvyDeclarationDtsTransform implements DtsTransform {
  private declarationFields = new Map<ClassDeclaration, IvyDeclarationField[]>();

  addFields(decl: ClassDeclaration, fields: IvyDeclarationField[]): void {
    this.declarationFields.set(decl, fields);
  }

  transformClass(
      clazz: ts.ClassDeclaration, members: ReadonlyArray<ts.ClassElement>,
      imports: ImportManager): ts.ClassDeclaration {
    const original = ts.getOriginalNode(clazz) as ClassDeclaration;

    if (!this.declarationFields.has(original)) {
      return clazz;
    }
    const fields = this.declarationFields.get(original)!;

    const newMembers = fields.map(decl => {
      const modifiers = [ts.createModifier(ts.SyntaxKind.StaticKeyword)];
      const typeRef = translateType(decl.type, imports);
      markForEmitAsSingleLine(typeRef);
      return ts.createProperty(
          /* decorators */ undefined,
          /* modifiers */ modifiers,
          /* name */ decl.name,
          /* questionOrExclamationToken */ undefined,
          /* type */ typeRef,
          /* initializer */ undefined);
    });

    return ts.updateClassDeclaration(
        /* node */ clazz,
        /* decorators */ clazz.decorators,
        /* modifiers */ clazz.modifiers,
        /* name */ clazz.name,
        /* typeParameters */ clazz.typeParameters,
        /* heritageClauses */ clazz.heritageClauses,
        /* members */[...members, ...newMembers]);
  }
}

function markForEmitAsSingleLine(node: ts.Node) {
  ts.setEmitFlags(node, ts.EmitFlags.SingleLine);
  ts.forEachChild(node, markForEmitAsSingleLine);
}
