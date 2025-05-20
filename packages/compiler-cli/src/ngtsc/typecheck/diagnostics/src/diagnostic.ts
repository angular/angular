/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ParseSourceSpan} from '@angular/compiler';
import ts from 'typescript';

import {addDiagnosticChain, makeDiagnosticChain} from '../../../diagnostics';
import {
  ExternalTemplateSourceMapping,
  IndirectSourceMapping,
  TemplateDiagnostic,
  TypeCheckId,
  SourceMapping,
} from '../../api';

/**
 * Constructs a `ts.Diagnostic` for a given `ParseSourceSpan` within a template.
 */
export function makeTemplateDiagnostic(
  id: TypeCheckId,
  mapping: SourceMapping,
  span: ParseSourceSpan,
  category: ts.DiagnosticCategory,
  code: number,
  messageText: string | ts.DiagnosticMessageChain,
  relatedMessages?: {
    text: string;
    start: number;
    end: number;
    sourceFile: ts.SourceFile;
  }[],
): TemplateDiagnostic {
  if (mapping.type === 'direct') {
    let relatedInformation: ts.DiagnosticRelatedInformation[] | undefined = undefined;
    if (relatedMessages !== undefined) {
      relatedInformation = [];
      for (const relatedMessage of relatedMessages) {
        relatedInformation.push({
          category: ts.DiagnosticCategory.Message,
          code: 0,
          file: relatedMessage.sourceFile,
          start: relatedMessage.start,
          length: relatedMessage.end - relatedMessage.start,
          messageText: relatedMessage.text,
        });
      }
    }
    // For direct mappings, the error is shown inline as ngtsc was able to pinpoint a string
    // constant within the `@Component` decorator for the template. This allows us to map the error
    // directly into the bytes of the source file.
    return {
      source: 'ngtsc',
      code,
      category,
      messageText,
      file: mapping.node.getSourceFile(),
      sourceFile: mapping.node.getSourceFile(),
      typeCheckId: id,
      start: span.start.offset,
      length: span.end.offset - span.start.offset,
      relatedInformation,
    };
  } else if (mapping.type === 'indirect' || mapping.type === 'external') {
    // For indirect mappings (template was declared inline, but ngtsc couldn't map it directly
    // to a string constant in the decorator), the component's file name is given with a suffix
    // indicating it's not the TS file being displayed, but a template.
    // For external temoplates, the HTML filename is used.
    const componentSf = mapping.componentClass.getSourceFile();
    const componentName = mapping.componentClass.name.text;
    const fileName =
      mapping.type === 'indirect'
        ? `${componentSf.fileName} (${componentName} template)`
        : mapping.templateUrl;

    let relatedInformation: ts.DiagnosticRelatedInformation[] = [];
    if (relatedMessages !== undefined) {
      for (const relatedMessage of relatedMessages) {
        relatedInformation.push({
          category: ts.DiagnosticCategory.Message,
          code: 0,
          file: relatedMessage.sourceFile,
          start: relatedMessage.start,
          length: relatedMessage.end - relatedMessage.start,
          messageText: relatedMessage.text,
        });
      }
    }

    let sf: ts.SourceFile;
    try {
      sf = getParsedTemplateSourceFile(fileName, mapping);
    } catch (e) {
      const failureChain = makeDiagnosticChain(
        `Failed to report an error in '${fileName}' at ${span.start.line + 1}:${
          span.start.col + 1
        }`,
        [makeDiagnosticChain((e as Error)?.stack ?? `${e}`)],
      );
      return {
        source: 'ngtsc',
        category,
        code,
        messageText: addDiagnosticChain(messageText, [failureChain]),
        file: componentSf,
        sourceFile: componentSf,
        typeCheckId: id,
        // mapping.node represents either the 'template' or 'templateUrl' expression. getStart()
        // and getEnd() are used because they don't include surrounding whitespace.
        start: mapping.node.getStart(),
        length: mapping.node.getEnd() - mapping.node.getStart(),
        relatedInformation,
      };
    }

    relatedInformation.push({
      category: ts.DiagnosticCategory.Message,
      code: 0,
      file: componentSf,
      // mapping.node represents either the 'template' or 'templateUrl' expression. getStart()
      // and getEnd() are used because they don't include surrounding whitespace.
      start: mapping.node.getStart(),
      length: mapping.node.getEnd() - mapping.node.getStart(),
      messageText: `Error occurs in the template of component ${componentName}.`,
    });

    return {
      source: 'ngtsc',
      category,
      code,
      messageText,
      file: sf,
      sourceFile: componentSf,
      typeCheckId: id,
      start: span.start.offset,
      length: span.end.offset - span.start.offset,
      // Show a secondary message indicating the component whose template contains the error.
      relatedInformation,
    };
  } else {
    throw new Error(`Unexpected source mapping type: ${(mapping as {type: string}).type}`);
  }
}

const TemplateSourceFile = Symbol('TemplateSourceFile');

type TemplateSourceMappingWithSourceFile = (
  | ExternalTemplateSourceMapping
  | IndirectSourceMapping
) & {
  [TemplateSourceFile]?: ts.SourceFile;
};

function getParsedTemplateSourceFile(
  fileName: string,
  mapping: TemplateSourceMappingWithSourceFile,
): ts.SourceFile {
  if (mapping[TemplateSourceFile] === undefined) {
    mapping[TemplateSourceFile] = parseTemplateAsSourceFile(fileName, mapping.template);
  }

  return mapping[TemplateSourceFile];
}

let parseTemplateAsSourceFileForTest: typeof parseTemplateAsSourceFile | null = null;

export function setParseTemplateAsSourceFileForTest(fn: typeof parseTemplateAsSourceFile): void {
  parseTemplateAsSourceFileForTest = fn;
}

export function resetParseTemplateAsSourceFileForTest(): void {
  parseTemplateAsSourceFileForTest = null;
}

function parseTemplateAsSourceFile(fileName: string, template: string): ts.SourceFile {
  if (parseTemplateAsSourceFileForTest !== null) {
    return parseTemplateAsSourceFileForTest(fileName, template);
  }

  // TODO(alxhub): investigate creating a fake `ts.SourceFile` here instead of invoking the TS
  // parser against the template (HTML is just really syntactically invalid TypeScript code ;).
  return ts.createSourceFile(
    fileName,
    template,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ false,
    ts.ScriptKind.JSX,
  );
}

export function isTemplateDiagnostic(diagnostic: ts.Diagnostic): diagnostic is TemplateDiagnostic {
  return (
    diagnostic.hasOwnProperty('componentFile') && ts.isSourceFile((diagnostic as any).componentFile)
  );
}
