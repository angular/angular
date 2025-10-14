/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
import {addDiagnosticChain, makeDiagnosticChain} from '../../../diagnostics';
/**
 * Constructs a `ts.Diagnostic` for a given `ParseSourceSpan` within a template.
 *
 * @param deprecatedDiagInfo Optional information about deprecation and related messages.
 */
export function makeTemplateDiagnostic(
  id,
  mapping,
  span,
  category,
  code,
  messageText,
  relatedMessages,
  deprecatedDiagInfo,
) {
  if (mapping.type === 'direct') {
    let relatedInformation = [];
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
    if (deprecatedDiagInfo !== undefined) {
      relatedInformation.push(...(deprecatedDiagInfo.relatedMessages ?? []));
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
      reportsDeprecated: deprecatedDiagInfo?.reportsDeprecated,
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
    let relatedInformation = [];
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
    let sf;
    try {
      sf = getParsedTemplateSourceFile(fileName, mapping);
    } catch (e) {
      const failureChain = makeDiagnosticChain(
        `Failed to report an error in '${fileName}' at ${span.start.line + 1}:${span.start.col + 1}`,
        [makeDiagnosticChain(e?.stack ?? `${e}`)],
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
        reportsDeprecated: deprecatedDiagInfo?.reportsDeprecated,
      };
    }
    let typeForMessage;
    if (category === ts.DiagnosticCategory.Warning) {
      typeForMessage = 'Warning';
    } else if (category === ts.DiagnosticCategory.Suggestion) {
      typeForMessage = 'Suggestion';
    } else if (category === ts.DiagnosticCategory.Message) {
      typeForMessage = 'Message';
    } else {
      typeForMessage = 'Error';
    }
    if (deprecatedDiagInfo !== undefined) {
      relatedInformation.push(...(deprecatedDiagInfo.relatedMessages ?? []));
    }
    relatedInformation.push({
      category: ts.DiagnosticCategory.Message,
      code: 0,
      file: componentSf,
      // mapping.node represents either the 'template' or 'templateUrl' expression. getStart()
      // and getEnd() are used because they don't include surrounding whitespace.
      start: mapping.node.getStart(),
      length: mapping.node.getEnd() - mapping.node.getStart(),
      messageText: `${typeForMessage} occurs in the template of component ${componentName}.`,
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
      reportsDeprecated: deprecatedDiagInfo?.reportsDeprecated,
    };
  } else {
    throw new Error(`Unexpected source mapping type: ${mapping.type}`);
  }
}
const TemplateSourceFile = Symbol('TemplateSourceFile');
function getParsedTemplateSourceFile(fileName, mapping) {
  if (mapping[TemplateSourceFile] === undefined) {
    mapping[TemplateSourceFile] = parseTemplateAsSourceFile(fileName, mapping.template);
  }
  return mapping[TemplateSourceFile];
}
let parseTemplateAsSourceFileForTest = null;
export function setParseTemplateAsSourceFileForTest(fn) {
  parseTemplateAsSourceFileForTest = fn;
}
export function resetParseTemplateAsSourceFileForTest() {
  parseTemplateAsSourceFileForTest = null;
}
function parseTemplateAsSourceFile(fileName, template) {
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
export function isTemplateDiagnostic(diagnostic) {
  return diagnostic.hasOwnProperty('componentFile') && ts.isSourceFile(diagnostic.componentFile);
}
//# sourceMappingURL=diagnostic.js.map
