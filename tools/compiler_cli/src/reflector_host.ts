import {StaticReflectorHost, StaticType} from 'angular2/src/compiler/static_reflector';
import * as ts from 'typescript';
import {MetadataCollector, ModuleMetadata} from 'ts-metadata-collector';
import * as fs from 'fs';
import * as path from 'path';

const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
const DTS = /\.d\.ts$/;

export class NodeReflectorHost implements StaticReflectorHost {
  constructor(private program: ts.Program, private metadataCollector: MetadataCollector,
              private compilerHost: ts.CompilerHost, private options: ts.CompilerOptions) {}

// rename to staticref or staticsymbol
  findDeclaration(module: string, symbolName: string, containingFile: string): StaticType {
    if (!containingFile || !containingFile.length) {
      if (module.indexOf(".") === 0) {
        throw new Error("Resolution of relative paths requires a containing file.");
      }
      // Any containing file gives the same result for absolute imports
      containingFile = 'index.ts';
    }

    const resolve = (m:string) => {
      const resolved = ts.resolveModuleName(m, containingFile, this.options, this.compilerHost).resolvedModule;
      return resolved ? resolved.resolvedFileName : null
    };

    try {
      const filePath = resolve(module);
      if (!filePath) {
        throw new Error(`Could not resolve module ${module} relative to ${containingFile}`);
      }

      const tc = this.program.getTypeChecker();
      const sf = this.program.getSourceFile(filePath);

      let symbol =  tc.getExportsOfModule((<any>sf).symbol).find(m => m.name === symbolName);
      if (!symbol) {
        throw new Error(`can't find symbol ${symbolName} exported from module ${filePath}`);
      }
      while (symbol && symbol.flags & ts.SymbolFlags.Alias) {// This is an alias, follow what it aliases
        symbol = tc.getAliasedSymbol(symbol);
      }
      const declaration = symbol.getDeclarations()[0];
      const declarationFile = declaration.getSourceFile().fileName;

      let moduleId: string;
      const parts = declarationFile.replace(EXT, '').split(path.sep);
      for (let index = parts.length - 1; index >=0; index--) {
        let candidate = parts.slice(index, parts.length).join(path.sep);
        if (resolve(candidate) === declarationFile) {
          let pkg = parts[index];
          let pkgPath = parts.slice(index+1, parts.length).join(path.sep);
          moduleId = `asset:${pkg}/lib/${pkgPath}`;
          break;
        }
        if (resolve('.' + path.sep + candidate) === declarationFile) {
          moduleId = `asset:./lib/${candidate}`;
          break;
        }
      }
      return new StaticType(moduleId, declarationFile, symbol.getName());
    } catch (e) {
      console.error(`can't resolve module ${module} from ${containingFile}`);
      throw e;
    }

  }

// TODO take a statictype
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
