import {Reference} from '@angular/compiler-cli/src/ngtsc/imports';
import {DirectiveMeta, MetadataReader, NgModuleMeta, PipeMeta} from '@angular/compiler-cli/src/ngtsc/metadata';
import {ClassDeclaration} from '@angular/compiler-cli/src/ngtsc/reflection';
import {CompileMetadataResolver, StaticSymbol, StaticSymbolResolver} from '@angular/compiler/src/compiler';
import * as ts from 'typescript';

/**
 * A replacement for `DtsMetadataReader` which uses the View Engine metadata system instead of Ivy
 * .d.ts metadata to understand dependencies.
 */
export class ViewEngineDtsMetadataReader implements MetadataReader {
  constructor(
      private program: ts.Program, private checker: ts.TypeChecker,
      private symResolver: StaticSymbolResolver, private resolver: CompileMetadataResolver) {}

  getNgModuleMetadata(ref: Reference<ClassDeclaration<ts.Declaration>>): NgModuleMeta|null {
    const symbol = this.refToSymbol(ref);
    const meta = this.resolver.getNgModuleMetadata(symbol, false);
    if (meta === null) {
      return null;
    }
    return {
      ref, declarations:
               [
                 ...meta.declaredDirectives.map(dir => this.symbolToRef(dir.reference)),
                 ...meta.declaredPipes.map(pipe => this.symbolToRef(pipe.reference)),
               ],
          exports:
              [
                ...meta.exportedDirectives.map(dir => this.symbolToRef(dir.reference)),
                ...meta.exportedPipes.map(pipe => this.symbolToRef(pipe.reference)),
                ...meta.exportedModules.map(mod => this.symbolToRef(mod.type.reference)),
              ],
          imports: meta.importedModules.map(mod => this.symbolToRef(mod.type.reference)),
    }
  }

  getDirectiveMetadata(ref: Reference<ClassDeclaration<ts.Declaration>>): DirectiveMeta|null {
    const symbol = this.refToSymbol(ref);
    if (!this.resolver.isDirective(symbol)) {
      return null;
    }
    const meta = this.resolver.getDirectiveMetadata(symbol);
    return {
      selector: meta.selector || '',
      baseClass: null,
      exportAs: meta.exportAs !== null ? [meta.exportAs] : null,
      inputs: meta.inputs,
      isComponent: meta.isComponent,
      hasNgTemplateContextGuard: false,
      name: ref.node.name.text,
      ngTemplateGuards: [],
      outputs: meta.outputs,
      queries: meta.queries.map(q => q.propertyName),
      ref: ref,
    };
  }

  getPipeMetadata(ref: Reference<ClassDeclaration<ts.Declaration>>): PipeMeta|null {
    const symbol = this.refToSymbol(ref);
    const meta = this.resolver.getPipeMetadata(symbol);
    if (meta === null) {
      return null;
    }
    return { name: meta.name, ref, }
  }

  private refToSymbol(ref: Reference<ClassDeclaration<ts.Declaration>>): StaticSymbol {
    return this.symResolver.getStaticSymbol(ref.node.getSourceFile().fileName, ref.node.name.text);
  }

  private symbolToRef(symbol: StaticSymbol): Reference<ClassDeclaration<ts.Declaration>> {
    const sf = this.program.getSourceFile(symbol.filePath);
    if (!sf) {
      throw new Error(`Unable to find source file: ${symbol.filePath} for ${symbol.name}`);
    }
    const sfSym = this.checker.getSymbolAtLocation(sf) !;
    const res = this.checker.getExportsOfModule(sfSym).find(sym => sym.name === symbol.name);
    if (res === undefined || res.valueDeclaration === undefined) {
      throw new Error(`Unable to find symbol ${symbol.name} in ${symbol.filePath}`);
    }
    if (!ts.isClassDeclaration(res.valueDeclaration) || res.valueDeclaration.name === undefined ||
        !ts.isIdentifier(res.valueDeclaration.name)) {
      throw new Error(`Symbol ${symbol.name} from ${symbol.filePath} has the wrong shape`);
    }
    return new Reference(res.valueDeclaration) as Reference<ClassDeclaration<ts.ClassDeclaration>>;
  }
}
