import * as ts from 'typescript';

import {DelegatingHost} from './compiler_host';

export class DeclarationDownlevelingHost extends DelegatingHost {
  constructor(delegate: ts.CompilerHost, private options: ts.CompilerOptions) { super(delegate); }
  writeFile: ts.WriteFileCallback =
      (fileName, data, writeByteOrderMark, onError?, sourceFiles?): void => {
        if (fileName.match(/\.d\.ts$/)) {
          data = downlevelDeclaration(fileName, data, this.options.target);
        }
        this.delegate.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
      };
}

export function downlevelDeclaration(
    fileName: string, input: string, languageVersion: ts.ScriptTarget): string {
  const sourceFile = ts.createSourceFile(fileName, input, languageVersion, /*setParentNodes*/ true);

  let output = '';

  writeNode(sourceFile);

  function writeNode(node: ts.Node) {
    const children = node.getChildren();
    if (children.length) {
      for (const child of children) {
        switch (child.kind) {
          case ts.SyntaxKind.ClassDeclaration:
          case ts.SyntaxKind.InterfaceDeclaration:
          case ts.SyntaxKind.TypeLiteral:
            writeMemberfulNode(child as any);
            break;
          default:
            writeNode(child);
            break;
        }
      }
    } else {
      output += node.getFullText();
    }
  }

  function writeMemberfulNode(
      node: ts.ClassDeclaration | ts.InterfaceDeclaration | ts.TypeLiteralNode) {
    const children = node.getChildren();
    for (const child of children) {
      switch (child.kind) {
        case ts.SyntaxKind.SyntaxList:
          const grandChildren = child.getChildren();
          for (const grandChild of grandChildren) {
            switch (grandChild.kind) {
              case ts.SyntaxKind.PropertyDeclaration:
              case ts.SyntaxKind.PropertySignature:
                writePropertyNode(grandChild as any, node.kind);
                break;
              default:
                writeNode(grandChild);
                break;
            }
          }
          break;
        default:
          writeNode(child);
          break;
      }
    }
  }

  function writePropertyNode(
      node: ts.PropertyDeclaration | ts.PropertySignature, grandParentKind: ts.SyntaxKind) {
    const children = node.getChildren();
    for (const child of children) {
      switch (child.kind) {
        case ts.SyntaxKind.SyntaxList:
          const grandChildren = child.getChildren();
          for (const grandChild of grandChildren) {
            switch (grandChild.kind) {
              case ts.SyntaxKind.ReadonlyKeyword:
              case ts.SyntaxKind.AbstractKeyword:
                output += getLeadingTrivia(grandChild);
                break;
              default:
                writeNode(grandChild);
                break;
            }
          }
          break;
        case ts.SyntaxKind.QuestionToken:
          if (grandParentKind === ts.SyntaxKind.ClassDeclaration) {
            output += getLeadingTrivia(child);
          } else {
            writeNode(child);
          }
          break;
        default:
          writeNode(child);
          break;
      }
    }
  }

  function getLeadingTrivia(node: ts.Node) {
    let ret = sourceFile.text.substring(node.getFullStart(), node.getStart());
    if (ret[ret.length - 1] === ' ') {
      ret = ret.substr(0, ret.length - 1);
    }
    return ret;
  }
  return output;
}
