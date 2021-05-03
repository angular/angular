/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceSpan} from '@angular/compiler';
import * as ts from 'typescript';

import {ExternalTemplateSourceMapping, TemplateId, TemplateSourceMapping} from '../../api';

/**
 * A `ts.Diagnostic` with additional information about the diagnostic related to template
 * type-checking.
 */
export interface TemplateDiagnostic extends ts.Diagnostic {
  /**
   * The component with the template that resulted in this diagnostic.
   */
  componentFile: ts.SourceFile;

  /**
   * The template id of the component that resulted in this diagnostic.
   */
  templateId: TemplateId;
}

/**
 * Constructs a `ts.Diagnostic` for a given `ParseSourceSpan` within a template.
 */
export function makeTemplateDiagnostic(
    templateId: TemplateId, mapping: TemplateSourceMapping, span: ParseSourceSpan,
    category: ts.DiagnosticCategory, code: number, messageText: string|ts.DiagnosticMessageChain,
    relatedMessage?: {
      text: string,
      span: ParseSourceSpan,
    }): TemplateDiagnostic {
  if (mapping.type === 'direct') {
    let relatedInformation: ts.DiagnosticRelatedInformation[]|undefined = undefined;
    if (relatedMessage !== undefined) {
      relatedInformation = [{
        category: ts.DiagnosticCategory.Message,
        code: 0,
        file: mapping.node.getSourceFile(),
        start: relatedMessage.span.start.offset,
        length: relatedMessage.span.end.offset - relatedMessage.span.start.offset,
        messageText: relatedMessage.text,
      }];
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
      componentFile: mapping.node.getSourceFile(),
      templateId,
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
    // TODO(alxhub): remove cast when TS in g3 supports this narrowing.
    const fileName = mapping.type === 'indirect' ?
        `${componentSf.fileName} (${componentName} template)` :
        (mapping as ExternalTemplateSourceMapping).templateUrl;
    // TODO(alxhub): investigate creating a fake `ts.SourceFile` here instead of invoking the TS
    // parser against the template (HTML is just really syntactically invalid TypeScript code ;).
    // Also investigate caching the file to avoid running the parser multiple times.
    const sf = ts.createSourceFile(
        fileName, mapping.template, ts.ScriptTarget.Latest, false, ts.ScriptKind.JSX);

    let relatedInformation: ts.DiagnosticRelatedInformation[] = [];
    if (relatedMessage !== undefined) {
      relatedInformation.push({
        category: ts.DiagnosticCategory.Message,
        code: 0,
        file: sf,
        start: relatedMessage.span.start.offset,
        length: relatedMessage.span.end.offset - relatedMessage.span.start.offset,
        messageText: relatedMessage.text,
      });
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
      componentFile: componentSf,
      templateId,
      start: span.start.offset,
      length: span.end.offset - span.start.offset,
      // Show a secondary message indicating the component whose template contains the error.
      relatedInformation,
    };
  } else {
    throw new Error(`Unexpected source mapping type: ${(mapping as {type: string}).type}`);
  }
}

export function isTemplateDiagnostic(diagnostic: ts.Diagnostic): diagnostic is TemplateDiagnostic {
  return diagnostic.hasOwnProperty('componentFile') &&
      ts.isSourceFile((diagnostic as any).componentFile);
}
