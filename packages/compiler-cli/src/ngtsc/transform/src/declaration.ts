/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '@angular/compiler';
import ts from 'typescript';

import {ImportRewriter, ReferenceEmitter} from '../../imports';
import {ClassDeclaration, ReflectionHost} from '../../reflection';
import {
  ImportManager,
  presetImportManagerForceNamespaceImports,
  translateType,
} from '../../translator';

import {DtsTransform} from './api';

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
  getAllTransforms(sf: ts.SourceFile): DtsTransform[] | null {
    // No need to transform if it's not a declarations file, or if no changes have been requested
    // to the input file. Due to the way TypeScript afterDeclarations transformers work, the
    // `ts.SourceFile` path is the same as the original .ts. The only way we know it's actually a
    // declaration file is via the `isDeclarationFile` property.
    if (!sf.isDeclarationFile) {
      return null;
    }
    const originalSf = ts.getOriginalNode(sf) as ts.SourceFile;

    let transforms: DtsTransform[] | null = null;
    if (this.ivyDeclarationTransforms.has(originalSf)) {
      transforms = [];
      transforms.push(this.ivyDeclarationTransforms.get(originalSf)!);
    }
    return transforms;
  }
}

export function declarationTransformFactory(
  transformRegistry: DtsTransformRegistry,
  reflector: ReflectionHost,
  refEmitter: ReferenceEmitter,
  importRewriter: ImportRewriter,
): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    const transformer = new DtsTransformer(context, reflector, refEmitter, importRewriter);
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
    private ctx: ts.TransformationContext,
    private reflector: ReflectionHost,
    private refEmitter: ReferenceEmitter,
    private importRewriter: ImportRewriter,
  ) {}

  /**
   * Transform the declaration file and add any declarations which were recorded.
   */
  transform(sf: ts.SourceFile, transforms: DtsTransform[]): ts.SourceFile {
    const imports = new ImportManager({
      ...presetImportManagerForceNamespaceImports,
      rewriter: this.importRewriter,
    });

    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      if (ts.isClassDeclaration(node)) {
        return this.transformClassDeclaration(node, transforms, imports);
      } else {
        // Otherwise return node as is.
        return ts.visitEachChild(node, visitor, this.ctx);
      }
    };

    // Recursively scan through the AST and process all nodes as desired.
    sf = ts.visitNode(sf, visitor, ts.isSourceFile) || sf;

    // Update/insert needed imports.
    return imports.transformTsFile(this.ctx, sf);
  }

  private transformClassDeclaration(
    clazz: ts.ClassDeclaration,
    transforms: DtsTransform[],
    imports: ImportManager,
  ): ts.ClassDeclaration {
    let newClazz: ts.ClassDeclaration = clazz;

    for (const transform of transforms) {
      if (transform.transformClass !== undefined) {
        newClazz = transform.transformClass(
          newClazz,
          newClazz.members,
          this.reflector,
          this.refEmitter,
          imports,
        );
      }
    }

    return newClazz;
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
    clazz: ts.ClassDeclaration,
    members: ReadonlyArray<ts.ClassElement>,
    reflector: ReflectionHost,
    refEmitter: ReferenceEmitter,
    imports: ImportManager,
  ): ts.ClassDeclaration {
    const original = ts.getOriginalNode(clazz) as ClassDeclaration;

    if (!this.declarationFields.has(original)) {
      return clazz;
    }
    const fields = this.declarationFields.get(original)!;

    const newMembers = fields.map((decl) => {
      const modifiers = [ts.factory.createModifier(ts.SyntaxKind.StaticKeyword)];
      const typeRef = translateType(
        decl.type,
        original.getSourceFile(),
        reflector,
        refEmitter,
        imports,
      );
      markForEmitAsSingleLine(typeRef);
      return ts.factory.createPropertyDeclaration(
        /* modifiers */ modifiers,
        /* name */ decl.name,
        /* questionOrExclamationToken */ undefined,
        /* type */ typeRef,
        /* initializer */ undefined,
      );
    });

    return ts.factory.updateClassDeclaration(
      /* node */ clazz,
      /* modifiers */ clazz.modifiers,
      /* name */ clazz.name,
      /* typeParameters */ clazz.typeParameters,
      /* heritageClauses */ clazz.heritageClauses,
      /* members */ [...members, ...newMembers],
    );
  }
}

function markForEmitAsSingleLine(node: ts.Node) {
  ts.setEmitFlags(node, ts.EmitFlags.SingleLine);
  ts.forEachChild(node, markForEmitAsSingleLine);
}
