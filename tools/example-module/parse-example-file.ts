import * as ts from 'typescript';

interface ParsedMetadata {
  primary: boolean;
  component: string;
  title: string;
  templateUrl: string;
  styleUrls: string[];
}

interface ParsedMetadataResults {
  primaryComponent: ParsedMetadata;
  secondaryComponents: ParsedMetadata[];
}

/** Parse the AST of the given source file and collect Angular component metadata. */
export function parseExampleFile(fileName: string, content: string): ParsedMetadataResults {
  const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, false);
  const metas: any[] = [];

  const visitNode = (node: any): void => {
    if (node.kind === ts.SyntaxKind.ClassDeclaration) {
      const meta: any = {
        component: node.name.text
      };

      if (node.jsDoc && node.jsDoc.length) {
        for (const doc of node.jsDoc) {
          if (doc.tags && doc.tags.length) {
            for (const tag of doc.tags) {
              const tagValue = tag.comment;
              const tagName = tag.tagName.text;
              if (tagName === 'title') {
                meta.title = tagValue;
                meta.primary = true;
              }
            }
          }
        }
      }

      if (node.decorators && node.decorators.length) {
        for (const decorator of node.decorators) {
          if (decorator.expression.expression.text === 'Component') {
            for (const arg of decorator.expression.arguments) {
              for (const prop of arg.properties) {
                const propName = prop.name.text;

                // Since additional files can be also stylesheets, we need to properly parse
                // the styleUrls metadata property.
                if (propName === 'styleUrls' && ts.isArrayLiteralExpression(prop.initializer)) {
                  meta[propName] = prop.initializer.elements
                    .map((literal: ts.StringLiteral) => literal.text);
                } else {
                  meta[propName] = prop.initializer.text;
                }
              }
            }

            metas.push(meta);
          }
        }
      }
    }

    ts.forEachChild(node, visitNode);
  };

  visitNode(sourceFile);

  return {
    primaryComponent: metas.find(m => m.primary),
    secondaryComponents: metas.filter(m => !m.primary)
  };
}
