import {StaticReflectorHost, StaticSymbol} from 'angular2/src/compiler/static_reflector';
import * as ts from 'typescript';
import {MetadataCollector, ModuleMetadata} from 'ts-metadata-collector';
import * as fs from 'fs';
import * as path from 'path';

const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
const DTS = /\.d\.ts$/;

export class NodeReflectorHost implements StaticReflectorHost {
  constructor(private program: ts.Program, private metadataCollector: MetadataCollector,
              private compilerHost: ts.CompilerHost, private options: ts.CompilerOptions) {}

  private resolve(m: string, containingFile: string) {
    const resolved =
        ts.resolveModuleName(m, containingFile, this.options, this.compilerHost).resolvedModule;
    return resolved ? resolved.resolvedFileName : null
  };

  /**
   * We want a moduleId that will appear in import statements in the generated code.
   * These need to be in a form that system.js can load, so absolute file paths don't work.
   * Relativize the paths by checking candidate prefixes of the absolute path, to see if
   * they are resolvable by the moduleResolution strategy from the CompilerHost.
   */
  private getModuleId(declarationFile: string, containingFile: string) {
    const parts = declarationFile.replace(EXT, '').split(path.sep);

    for (let index = parts.length - 1; index >= 0; index--) {
      let candidate = parts.slice(index, parts.length).join(path.sep);
      if (this.resolve(candidate, containingFile) === declarationFile) {
        let pkg = parts[index];
        let pkgPath = parts.slice(index + 1, parts.length).join(path.sep);
        return `asset:${pkg}/lib/${pkgPath}`;
      }
    }
    for (let index = parts.length - 1; index >= 0; index--) {
      let candidate = parts.slice(index, parts.length).join(path.sep);
      if (this.resolve('.' + path.sep + candidate, containingFile) === declarationFile) {
        return `asset:./lib/${candidate}`;
      }
    }
    throw new Error(
        `Unable to find any resolvable import for ${declarationFile} relative to ${containingFile}`);
  }

  findDeclaration(module: string, symbolName: string, containingFile: string,
                  containingModule?: string): StaticSymbol {
    if (!containingFile || !containingFile.length) {
      if (module.indexOf(".") === 0) {
        throw new Error("Resolution of relative paths requires a containing file.");
      }
      // Any containing file gives the same result for absolute imports
      containingFile = 'index.ts';
    }

    try {
      const filePath = this.resolve(module, containingFile);

      if (!filePath) {
        throw new Error(`Could not resolve module ${module} relative to ${containingFile}`);
      }

      const tc = this.program.getTypeChecker();
      const sf = this.program.getSourceFile(filePath);

      let symbol = tc.getExportsOfModule((<any>sf).symbol).find(m => m.name === symbolName);
      if (!symbol) {
        throw new Error(`can't find symbol ${symbolName} exported from module ${filePath}`);
      }
      while (symbol &&
             symbol.flags & ts.SymbolFlags.Alias) {  // This is an alias, follow what it aliases
        symbol = tc.getAliasedSymbol(symbol);
      }
      const declaration = symbol.getDeclarations()[0];
      const declarationFile = declaration.getSourceFile().fileName;
      const moduleId = this.getModuleId(declarationFile, containingFile);

      return this.getStaticSymbol(moduleId, declarationFile, symbol.getName());
    } catch (e) {
      console.error(`can't resolve module ${module} from ${containingFile}`);
      throw e;
    }
  }

  private typeCache = new Map<string, StaticSymbol>();

  /**
   * getStaticSymbol produces a Type whose metadata is known but whose implementation is not loaded.
   * All types passed to the StaticResolver should be pseudo-types returned by this method.
   *
   * @param moduleId the module identifier as an absolute path.
   * @param declarationFile the absolute path of the file where the symbol is declared
   * @param name the name of the type.
   */
  getStaticSymbol(moduleId: string, declarationFile: string, name: string): StaticSymbol {
    let key = `"${declarationFile}".${name}`;
    let result = this.typeCache.get(key);
    if (!result) {
      result = new StaticSymbol(moduleId, declarationFile, name);
      this.typeCache.set(key, result);
    }
    return result;
  }

  // TODO(alexeagle): take a statictype
  getMetadataFor(filePath: string): ModuleMetadata {
    if (!fs.existsSync(filePath)) {
      throw new Error(`No such file '${filePath}'`);
    }
    if (DTS.test(filePath)) {
      const metadataPath = filePath.replace(DTS, '.metadata.json');
      if (fs.existsSync(metadataPath)) {
        return this.readMetadata(metadataPath);
      }
    }

    let sf = this.program.getSourceFile(filePath);
    if (!sf) {
      throw new Error(`Source file ${filePath} not present in program.`);
    }
    const metadata = this.metadataCollector.getMetadata(sf, this.program.getTypeChecker());
    return metadata;
  }

  readMetadata(filePath: string) {
    try {
      const result = JSON.parse(fs.readFileSync(filePath, {encoding: 'utf-8'}));
      return result;
    } catch (e) {
      console.error(`Failed to read JSON file ${filePath}`);
      throw e;
    }
  }

  writeMetadata(emitFilePath: string, sourceFile: ts.SourceFile) {
    if (DTS.test(emitFilePath)) {
      const path = emitFilePath.replace(DTS, '.metadata.json');
      const metadata =
          this.metadataCollector.getMetadata(sourceFile, this.program.getTypeChecker());
      if (metadata && metadata.metadata) {
        const metadataText = JSON.stringify(metadata);
        fs.writeFileSync(path, metadataText, {encoding: 'utf-8'});
      }
    }
  }
}
