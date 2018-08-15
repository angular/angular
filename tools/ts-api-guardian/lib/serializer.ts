/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript';

const baseTsOptions: ts.CompilerOptions = {
  // We don't want symbols from external modules to be resolved, so we use the
  // classic algorithm.
  moduleResolution: ts.ModuleResolutionKind.Classic
};

export interface JsDocTagOptions {
  /**
   * An array of names of jsdoc tags, one of which must exist. If no tags are provided, there are no
   * required tags.
   */
  requireAtLeastOne?: string[];

  /**
   * An array of names of jsdoc tags that must not exist.
   */
  banned?: string[];

  /**
   * An array of names of jsdoc tags that will be copied to the serialized code.
   */
  toCopy?: string[];
}

export interface SerializationOptions {
  /**
   * Removes all exports matching the regular expression.
   */
  stripExportPattern?: RegExp|RegExp[];
  /**
   * Allows these identifiers as modules in the output. For example,
   * ```
   * import * as angular from './angularjs';
   *
   * export class Foo extends angular.Bar {}
   * ```
   * will produce `export class Foo extends angular.Bar {}` and requires explicitly allowing
   * `angular` as a module identifier.
   */
  allowModuleIdentifiers?: string[];

  /** The jsdoc tag options for top level exports */
  exportTags?: JsDocTagOptions;

  /** The jsdoc tag options for properties/methods/etc of exports */
  memberTags?: JsDocTagOptions;

  /** The jsdoc tag options for parameters of members/functions */
  paramTags?: JsDocTagOptions;
}

export type DiagnosticSeverity = 'warn'|'error'|'none';

export function publicApi(fileName: string, options: SerializationOptions = {}): string {
  return publicApiInternal(ts.createCompilerHost(baseTsOptions), fileName, baseTsOptions, options);
}

export function publicApiInternal(
    host: ts.CompilerHost, fileName: string, tsOptions: ts.CompilerOptions,
    options: SerializationOptions = {}): string {
  // Since the entry point will be compared with the source files from the TypeScript program,
  // the path needs to be normalized with forward slashes in order to work within Windows.
  const entrypoint = path.normalize(fileName).replace(/\\/g, '/');

  // Setup default tag options
  options = {
    ...options,
    exportTags: applyDefaultTagOptions(options.exportTags),
    memberTags: applyDefaultTagOptions(options.memberTags),
    paramTags: applyDefaultTagOptions(options.paramTags)
  };

  if (!entrypoint.match(/\.d\.ts$/)) {
    throw new Error(`Source file "${fileName}" is not a declaration file`);
  }

  const program = ts.createProgram([entrypoint], tsOptions, host);
  return new ResolvedDeclarationEmitter(program, entrypoint, options).emit();
}

interface Diagnostic {
  type?: DiagnosticSeverity;
  message: string;
}

class ResolvedDeclarationEmitter {
  private program: ts.Program;
  private fileName: string;
  private typeChecker: ts.TypeChecker;
  private options: SerializationOptions;
  private diagnostics: Diagnostic[];

  constructor(program: ts.Program, fileName: string, options: SerializationOptions) {
    this.program = program;
    this.fileName = fileName;
    this.options = options;
    this.diagnostics = [];

    this.typeChecker = this.program.getTypeChecker();
  }

  emit(): string {
    const sourceFile = this.program.getSourceFiles().find(sf => sf.fileName === this.fileName);
    if (!sourceFile) {
      throw new Error(`Source file "${this.fileName}" not found`);
    }

    let output: string[] = [];

    const resolvedSymbols = this.getResolvedSymbols(sourceFile);
    // Sort all symbols so that the output is more deterministic
    resolvedSymbols.sort(symbolCompareFunction);

    for (const symbol of resolvedSymbols) {
      if (this.isExportPatternStripped(symbol.name)) {
        continue;
      }

      const typeDecl = symbol.declarations && symbol.declarations[0];
      const valDecl = symbol.valueDeclaration;
      if (!typeDecl && !valDecl) {
        this.diagnostics.push({
          type: 'warn',
          message: `${sourceFile.fileName}: error: No declaration found for symbol "${symbol.name}"`
        });
        continue;
      }
      typeDecl && this.emitDeclaration(symbol, typeDecl, output);
      if (valDecl && typeDecl.kind === ts.SyntaxKind.InterfaceDeclaration) {
        // Only generate value declarations in case of interfaces.
        valDecl && this.emitDeclaration(symbol, valDecl, output);
      }
    }

    if (this.diagnostics.length) {
      const message = this.diagnostics.map(d => d.message).join('\n');
      console.warn(message);
      if (this.diagnostics.some(d => d.type === 'error')) {
        throw new Error(message);
      }
    }

    return output.join('');
  }

  emitDeclaration(symbol: ts.Symbol, decl: ts.Node, output: string[]) {
    // The declaration node may not be a complete statement, e.g. for var/const
    // symbols. We need to find the complete export statement by traversing
    // upwards.
    while (!hasModifier(decl, ts.SyntaxKind.ExportKeyword) && decl.parent) {
      decl = decl.parent;
    }

    if (hasModifier(decl, ts.SyntaxKind.ExportKeyword)) {
      // Make an empty line between two exports
      if (output.length) {
        output.push('\n');
      }

      const jsdocComment = this.processJsDocTags(decl, this.options.exportTags);
      if (jsdocComment) {
        output.push(jsdocComment + '\n');
      }

      output.push(stripEmptyLines(this.emitNode(decl)) + '\n');
    } else {
      // This may happen for symbols re-exported from external modules.
      this.diagnostics.push({
        type: 'warn',
        message: createErrorMessage(decl, `No export declaration found for symbol "${symbol.name}"`)
      });
    }
  }

  private isExportPatternStripped(symbolName: string): boolean {
    return [].concat(this.options.stripExportPattern).some(p => !!(p && symbolName.match(p)));
  }

  private getResolvedSymbols(sourceFile: ts.SourceFile): ts.Symbol[] {
    const ms = (<any>sourceFile).symbol;
    const rawSymbols = ms ? (this.typeChecker.getExportsOfModule(ms) || []) : [];
    return rawSymbols.map(s => {
      if (s.flags & ts.SymbolFlags.Alias) {
        const resolvedSymbol = this.typeChecker.getAliasedSymbol(s);

        // This will happen, e.g. for symbols re-exported from external modules.
        if (!resolvedSymbol.valueDeclaration && !resolvedSymbol.declarations) {
          return s;
        }
        if (resolvedSymbol.name !== s.name) {
          if (this.isExportPatternStripped(s.name)) {
            return s;
          }
          throw new Error(
              `Symbol "${resolvedSymbol.name}" was aliased as "${s.name}". ` +
              `Aliases are not supported."`);
        }

        return resolvedSymbol;
      } else {
        return s;
      }
    });
  }

  emitNode(node: ts.Node) {
    if (hasModifier(node, ts.SyntaxKind.PrivateKeyword)) {
      return '';
    }

    const firstQualifier: ts.Identifier|null = getFirstQualifier(node);

    if (firstQualifier) {
      let isAllowed = false;

      // Try to resolve the qualifier.
      const resolvedSymbol = this.typeChecker.getSymbolAtLocation(firstQualifier);
      if (resolvedSymbol && resolvedSymbol.declarations && resolvedSymbol.declarations.length > 0) {
        // If the qualifier can be resolved, and it's not a namespaced import, then it should be
        // allowed.
        isAllowed =
            resolvedSymbol.declarations.every(decl => decl.kind !== ts.SyntaxKind.NamespaceImport);
      }

      // If it is not allowed otherwise, it's allowed if it's on the list of allowed identifiers.
      isAllowed = isAllowed ||
          !(!this.options.allowModuleIdentifiers ||
            this.options.allowModuleIdentifiers.indexOf(firstQualifier.text) < 0);
      if (!isAllowed) {
        this.diagnostics.push({
          type: 'error',
          message: createErrorMessage(
              firstQualifier,
              `Module identifier "${firstQualifier.text}" is not allowed. Remove it ` +
                  `from source or allow it via --allowModuleIdentifiers.`)
        });
      }
    }

    let children: ts.Node[] = [];
    if (ts.isFunctionDeclaration(node)) {
      // Used ts.isFunctionDeclaration instead of node.kind because this is a type guard
      const symbol = this.typeChecker.getSymbolAtLocation(node.name);
      symbol.declarations.forEach(x => children = children.concat(x.getChildren()));
    } else {
      children = node.getChildren();
    }

    const sourceText = node.getSourceFile().text;
    if (children.length) {
      // Sort declarations under a class or an interface
      if (node.kind === ts.SyntaxKind.SyntaxList) {
        switch (node.parent && node.parent.kind) {
          case ts.SyntaxKind.ClassDeclaration:
          case ts.SyntaxKind.InterfaceDeclaration: {
            // There can be multiple SyntaxLists under a class or an interface,
            // since SyntaxList is just an arbitrary data structure generated
            // by Node#getChildren(). We need to check that we are sorting the
            // right list.
            if (children.every(node => node.kind in memberDeclarationOrder)) {
              children = children.slice();
              children.sort((a: ts.NamedDeclaration, b: ts.NamedDeclaration) => {
                // Static after normal
                return compareFunction(
                           hasModifier(a, ts.SyntaxKind.StaticKeyword),
                           hasModifier(b, ts.SyntaxKind.StaticKeyword)) ||
                    // Our predefined order
                    compareFunction(
                           memberDeclarationOrder[a.kind], memberDeclarationOrder[b.kind]) ||
                    // Alphebetical order
                    // We need safe dereferencing due to edge cases, e.g. having two call signatures
                    compareFunction((a.name || a).getText(), (b.name || b).getText());
              });
            }
            break;
          }
        }
      }

      let output: string = children.filter(x => x.kind !== ts.SyntaxKind.JSDocComment)
                               .map(n => this.emitNode(n))
                               .join('');

      // Print stability annotation for fields and parmeters
      if (ts.isParameter(node) || node.kind in memberDeclarationOrder) {
        const tagOptions = ts.isParameter(node) ? this.options.paramTags : this.options.memberTags;
        const jsdocComment = this.processJsDocTags(node, tagOptions);
        if (jsdocComment) {
          // Add the annotation after the leading whitespace
          output = output.replace(/^(\r?\n\s*)/, `$1${jsdocComment} `);
        }
      }

      return output;
    } else {
      const ranges = ts.getLeadingCommentRanges(sourceText, node.pos);
      let tail = node.pos;
      for (const range of ranges || []) {
        if (range.end > tail) {
          tail = range.end;
        }
      }
      return sourceText.substring(tail, node.end);
    }
  }

  private processJsDocTags(node: ts.Node, tagOptions: JsDocTagOptions) {
    const jsDocTags = getJsDocTags(node);
    const requireAtLeastOne = tagOptions.requireAtLeastOne;
    const isMissingAnyRequiredTag = requireAtLeastOne != null && requireAtLeastOne.length > 0 &&
        jsDocTags.every(tag => requireAtLeastOne.indexOf(tag) === -1);
    if (isMissingAnyRequiredTag) {
      this.diagnostics.push({
        type: 'error',
        message: createErrorMessage(
            node,
            'Required jsdoc tags - One of the tags: ' +
                requireAtLeastOne.map(tag => `"@${tag}"`).join(', ') +
                ` - must exist on ${getName(node)}.`)
      });
    }
    const bannedTagsFound =
        tagOptions.banned.filter(bannedTag => jsDocTags.some(tag => tag === bannedTag));
    if (bannedTagsFound.length) {
      this.diagnostics.push({
        type: 'error',
        message: createErrorMessage(
            node,
            'Banned jsdoc tags - ' + bannedTagsFound.map(tag => `"@${tag}"`).join(', ') +
                ` - were found on ${getName(node)}.`)
      });
    }
    const tagsToCopy =
        jsDocTags.filter(tag => tagOptions.toCopy.some(tagToCopy => tag === tagToCopy));

    if (tagsToCopy.length === 1) {
      return `/** @${tagsToCopy[0]} */`;
    } else if (tagsToCopy.length > 1) {
      return '/**\n' + tagsToCopy.map(tag => ` * @${tag}`).join('\n') + ' */\n';
    } else {
      return '';
    }
  }
}

const tagRegex = /@(\w+)/g;

function getJsDocTags(node: ts.Node): string[] {
  const sourceText = node.getSourceFile().text;
  const trivia = sourceText.substr(node.pos, node.getLeadingTriviaWidth());
  // We use a hash so that we don't collect duplicate jsdoc tags
  // (e.g. if a property has a getter and setter with the same tag).
  const jsdocTags: {[key: string]: boolean} = {};
  let match: RegExpExecArray;
  while (match = tagRegex.exec(trivia)) {
    jsdocTags[match[1]] = true;
  }
  return Object.keys(jsdocTags);
}

function symbolCompareFunction(a: ts.Symbol, b: ts.Symbol) {
  return a.name.localeCompare(b.name);
}

function compareFunction<T>(a: T, b: T) {
  return a === b ? 0 : a > b ? 1 : -1;
}

const memberDeclarationOrder: {[key: number]: number} = {
  [ts.SyntaxKind.PropertySignature]: 0,
  [ts.SyntaxKind.PropertyDeclaration]: 0,
  [ts.SyntaxKind.GetAccessor]: 0,
  [ts.SyntaxKind.SetAccessor]: 0,
  [ts.SyntaxKind.CallSignature]: 1,
  [ts.SyntaxKind.Constructor]: 2,
  [ts.SyntaxKind.ConstructSignature]: 2,
  [ts.SyntaxKind.IndexSignature]: 3,
  [ts.SyntaxKind.MethodSignature]: 4,
  [ts.SyntaxKind.MethodDeclaration]: 4
};

function stripEmptyLines(text: string): string {
  return text.split(/\r?\n/).filter(x => !!x.length).join('\n');
}

/**
 * Returns the first qualifier if the input node is a dotted expression.
 */
function getFirstQualifier(node: ts.Node): ts.Identifier|null {
  switch (node.kind) {
    case ts.SyntaxKind.PropertyAccessExpression: {
      // For expression position
      let lhs = node;
      do {
        lhs = (<ts.PropertyAccessExpression>lhs).expression;
      } while (lhs && lhs.kind !== ts.SyntaxKind.Identifier);

      return <ts.Identifier>lhs;
    }
    case ts.SyntaxKind.TypeReference: {
      // For type position
      let lhs: ts.Node = (<ts.TypeReferenceNode>node).typeName;
      do {
        lhs = (<ts.QualifiedName>lhs).left;
      } while (lhs && lhs.kind !== ts.SyntaxKind.Identifier);

      return <ts.Identifier>lhs;
    }
    default:
      return null;
  }
}

function createErrorMessage(node: ts.Node, message: string): string {
  const sourceFile = node.getSourceFile();
  let position;
  if (sourceFile) {
    const {line, character} = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    position = `${sourceFile.fileName}(${line + 1},${character + 1})`;
  } else {
    position = '<unknown>';
  }

  return `${position}: error: ${message}`;
}

function hasModifier(node: ts.Node, modifierKind: ts.SyntaxKind): boolean {
  return !!node.modifiers && node.modifiers.some(x => x.kind === modifierKind);
}

function applyDefaultTagOptions(tagOptions: JsDocTagOptions|undefined): JsDocTagOptions {
  return {requireAtLeastOne: [], banned: [], toCopy: [], ...tagOptions};
}

function getName(node: any) {
  return '`' + (node.name && node.name.text ? node.name.text : node.getText()) + '`';
}
