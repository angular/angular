import {StaticReflectorHost, StaticType} from 'angular2/src/compiler/static_reflector';
import * as ts from 'typescript';
import {MetadataCollector, ModuleMetadata} from 'ts-metadata-collector';
import * as fs from 'fs';

const EXTS = ['', '.ts', '.d.ts', '.js', '.jsx', '.tsx'];
const DTS = /\.d\.ts$/;

export class NodeReflectorHost implements StaticReflectorHost {
  constructor(private program: ts.Program, private metadataCollector: MetadataCollector,
              private compilerHost: ts.CompilerHost, private options: ts.CompilerOptions) {}

  resolveModule(moduleId: string, containingFile: string) {
    if (!containingFile || !containingFile.length) {
      containingFile = 'index.ts';
    }
    try {
      return ts.resolveModuleName(moduleId, containingFile, this.options, this.compilerHost).resolvedModule.resolvedFileName;
    } catch (e) {
      console.error(`can't resolve module ${moduleId} from ${containingFile}`, e);
      throw e;
    }
  }

  findDeclaration(moduleName: string, symbolName: string): {declarationPath: string, declaredName: string} {
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
    return {declarationPath: declaration.getSourceFile().fileName, declaredName: symbol.getName()};
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
