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

  resolveModule(module: string, containingFile?: string) {
    if (!containingFile || !containingFile.length) {
      containingFile = 'index.ts';
    }
    const resolve = (m:string) => {
      const resolved = ts.resolveModuleName(m, containingFile, this.options, this.compilerHost).resolvedModule;
      return resolved ? resolved.resolvedFileName : null
    };
    try {
      const filePath = resolve(module);
      let moduleId: string = null;

      const parts = filePath.replace(EXT, '').split(path.sep);
      for (let index = parts.length - 1; index >=0; index--) {
        let candidate = parts.slice(index, parts.length).join(path.sep);
        if (resolve(candidate) === filePath) {
          moduleId = `asset:tmp/lib/${candidate}`;
          break;
        }
        if (resolve(path.join('.', candidate)) === filePath) {
          moduleId = `asset:app/lib/${candidate}`;
          break;
        }
      }
      console.log(`for module ${module}, moduleId ${moduleId} path ${filePath}`);
      return {moduleId, filePath};
    } catch (e) {
      console.error(`can't resolve module ${module} from ${containingFile}`);
      throw e;
    }
  }

  findDeclaration(moduleName: string, symbolName: string): StaticType {
    const tc = this.program.getTypeChecker();
    const sf = this.program.getSourceFile(moduleName);

    let symbol =  tc.getExportsOfModule((<any>sf).symbol).find(m => m.name === symbolName);
    if (!symbol) {
      throw new Error(`can't find symbol ${symbolName} exported from module ${moduleName}`);
    }
    while (symbol && symbol.flags & ts.SymbolFlags.Alias) {// This is an alias, follow what it aliases
      symbol = tc.getAliasedSymbol(symbol);
    }
    const declaration = symbol.getDeclarations()[0];
    const declarationFile = declaration.getSourceFile().fileName;
    const {moduleId} = this.resolveModule(declarationFile);
    return {moduleId, filePath: declarationFile, name: symbol.getName()};
  }

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
