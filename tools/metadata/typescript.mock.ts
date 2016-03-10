import * as ts from 'typescript';
import * as fs from 'fs';

/**
 * A mock language service host that assumes mock-fs is used for the file system.
 */
export class MockHost implements ts.LanguageServiceHost {
  constructor(private fileNames: string[], private currentDirectory: string = process.cwd(),
              private libName?: string) {}

  getCompilationSettings(): ts.CompilerOptions {
    return {
      experimentalDecorators: true,
      modules: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES5
    };
  }

  getScriptFileNames(): string[] { return this.fileNames; }

  getScriptVersion(fileName: string): string { return "1"; }

  getScriptSnapshot(fileName: string): ts.IScriptSnapshot {
    if (fs.existsSync(fileName)) {
      return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName, 'utf8'))
    }
  }

  getCurrentDirectory(): string { return this.currentDirectory; }

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return this.libName || ts.getDefaultLibFilePath(options);
  }
}

export class MockNode implements ts.Node {
  constructor(public kind: ts.SyntaxKind = ts.SyntaxKind.Identifier, public flags: ts.NodeFlags = 0,
              public pos: number = 0, public end: number = 0) {}
  getSourceFile(): ts.SourceFile { return null; }
  getChildCount(sourceFile?: ts.SourceFile): number { return 0 }
  getChildAt(index: number, sourceFile?: ts.SourceFile): ts.Node { return null; }
  getChildren(sourceFile?: ts.SourceFile): ts.Node[] { return []; }
  getStart(sourceFile?: ts.SourceFile): number { return 0; }
  getFullStart(): number { return 0; }
  getEnd(): number { return 0; }
  getWidth(sourceFile?: ts.SourceFile): number { return 0; }
  getFullWidth(): number { return 0; }
  getLeadingTriviaWidth(sourceFile?: ts.SourceFile): number { return 0; }
  getFullText(sourceFile?: ts.SourceFile): string { return ''; }
  getText(sourceFile?: ts.SourceFile): string { return ''; }
  getFirstToken(sourceFile?: ts.SourceFile): ts.Node { return null; }
  getLastToken(sourceFile?: ts.SourceFile): ts.Node { return null; }
}

export class MockIdentifier extends MockNode implements ts.Identifier {
  public text: string;
  public _primaryExpressionBrand: any;
  public _memberExpressionBrand: any;
  public _leftHandSideExpressionBrand: any;
  public _incrementExpressionBrand: any;
  public _unaryExpressionBrand: any;
  public _expressionBrand: any;

  constructor(public name: string, kind: ts.SyntaxKind = ts.SyntaxKind.Identifier,
              flags: ts.NodeFlags = 0, pos: number = 0, end: number = 0) {
    super(kind, flags, pos, end);
    this.text = name;
  }
}

export class MockVariableDeclaration extends MockNode implements ts.VariableDeclaration {
  public _declarationBrand: any;

  constructor(public name: ts.Identifier, kind: ts.SyntaxKind = ts.SyntaxKind.VariableDeclaration,
              flags: ts.NodeFlags = 0, pos: number = 0, end: number = 0) {
    super(kind, flags, pos, end);
  }

  static of(name: string): MockVariableDeclaration {
    return new MockVariableDeclaration(new MockIdentifier(name));
  }
}

export class MockSymbol implements ts.Symbol {
  constructor(public name: string, private node: ts.Declaration = MockVariableDeclaration.of(name),
              public flags: ts.SymbolFlags = 0) {}

  getFlags(): ts.SymbolFlags { return this.flags; }
  getName(): string { return this.name; }
  getDeclarations(): ts.Declaration[] { return [this.node]; }
  getDocumentationComment(): ts.SymbolDisplayPart[] { return []; }

  static of(name: string): MockSymbol { return new MockSymbol(name); }
}

export function expectNoDiagnostics(diagnostics: ts.Diagnostic[]) {
  for (const diagnostic of diagnostics) {
    let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    let {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
  }
  expect(diagnostics.length).toBe(0);
}

export function allChildren<T>(node: ts.Node, cb: (node: ts.Node) => T) {
  return ts.forEachChild(node, child => {
    const result = cb(node);
    if (result) {
      return result;
    }
    return allChildren(child, cb);
  })
}

export function findVar(sourceFile: ts.SourceFile, name: string): ts.VariableDeclaration {
  return allChildren(sourceFile,
                     node => isVar(node) && isNamed(node.name, name) ? node : undefined);
}

export function findClass(sourceFile: ts.SourceFile, name: string): ts.ClassDeclaration {
  return ts.forEachChild(sourceFile,
                         node => isClass(node) && isNamed(node.name, name) ? node : undefined);
}

export function isVar(node: ts.Node): node is ts.VariableDeclaration {
  return node.kind === ts.SyntaxKind.VariableDeclaration;
}

export function isClass(node: ts.Node): node is ts.ClassDeclaration {
  return node.kind === ts.SyntaxKind.ClassDeclaration;
}

export function isNamed(node: ts.Node, name: string): node is ts.Identifier {
  return node.kind === ts.SyntaxKind.Identifier && (<ts.Identifier>node).text === name;
}
