/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  Element,
  LexerRange,
  Node,
  ParseError,
  ParseErrorLevel,
  ParseSourceSpan,
  ParseTreeResult,
  XmlParser,
} from '@angular/compiler';

import {Diagnostics} from '../../../diagnostics';

import {ParseAnalysis, ParsedTranslationBundle} from './translation_parser';

export function getAttrOrThrow(element: Element, attrName: string): string {
  const attrValue = getAttribute(element, attrName);
  if (attrValue === undefined) {
    throw new ParseError(element.sourceSpan, `Missing required "${attrName}" attribute:`);
  }
  return attrValue;
}

export function getAttribute(element: Element, attrName: string): string | undefined {
  const attr = element.attrs.find((a) => a.name === attrName);
  return attr !== undefined ? attr.value : undefined;
}

/**
 * Parse the "contents" of an XML element.
 *
 * This would be equivalent to parsing the `innerHTML` string of an HTML document.
 *
 * @param element The element whose inner range we want to parse.
 * @returns a collection of XML `Node` objects and any errors that were parsed from the element's
 *     contents.
 */
export function parseInnerRange(element: Element): ParseTreeResult {
  const xmlParser = new XmlParser();
  const xml = xmlParser.parse(
    element.sourceSpan.start.file.content,
    element.sourceSpan.start.file.url,
    {tokenizeExpansionForms: true, range: getInnerRange(element)},
  );
  return xml;
}

/**
 * Compute a `LexerRange` that contains all the children of the given `element`.
 * @param element The element whose inner range we want to compute.
 */
function getInnerRange(element: Element): LexerRange {
  const start = element.startSourceSpan.end;
  const end = element.endSourceSpan!.start;
  return {
    startPos: start.offset,
    startLine: start.line,
    startCol: start.col,
    endPos: end.offset,
  };
}

/**
 * This "hint" object is used to pass information from `analyze()` to `parse()` for
 * `TranslationParser`s that expect XML contents.
 *
 * This saves the `parse()` method from having to re-parse the XML.
 */
export interface XmlTranslationParserHint {
  element: Element;
  errors: ParseError[];
}

/**
 * Can this XML be parsed for translations, given the expected `rootNodeName` and expected root node
 * `attributes` that should appear in the file.
 *
 * @param filePath The path to the file being checked.
 * @param contents The contents of the file being checked.
 * @param rootNodeName The expected name of an XML root node that should exist.
 * @param attributes The attributes (and their values) that should appear on the root node.
 * @returns The `XmlTranslationParserHint` object for use by `TranslationParser.parse()` if the XML
 * document has the expected format.
 */
export function canParseXml(
  filePath: string,
  contents: string,
  rootNodeName: string,
  attributes: Record<string, string>,
): ParseAnalysis<XmlTranslationParserHint> {
  const diagnostics = new Diagnostics();
  const xmlParser = new XmlParser();
  const xml = xmlParser.parse(contents, filePath);

  if (
    xml.rootNodes.length === 0 ||
    xml.errors.some((error) => error.level === ParseErrorLevel.ERROR)
  ) {
    xml.errors.forEach((e) => addParseError(diagnostics, e));
    return {canParse: false, diagnostics};
  }

  const rootElements = xml.rootNodes.filter(isNamedElement(rootNodeName));
  const rootElement = rootElements[0];
  if (rootElement === undefined) {
    diagnostics.warn(`The XML file does not contain a <${rootNodeName}> root node.`);
    return {canParse: false, diagnostics};
  }

  for (const attrKey of Object.keys(attributes)) {
    const attr = rootElement.attrs.find((attr) => attr.name === attrKey);
    if (attr === undefined || attr.value !== attributes[attrKey]) {
      addParseDiagnostic(
        diagnostics,
        rootElement.sourceSpan,
        `The <${rootNodeName}> node does not have the required attribute: ${attrKey}="${attributes[attrKey]}".`,
        ParseErrorLevel.WARNING,
      );
      return {canParse: false, diagnostics};
    }
  }

  if (rootElements.length > 1) {
    xml.errors.push(
      new ParseError(
        xml.rootNodes[1].sourceSpan,
        'Unexpected root node. XLIFF 1.2 files should only have a single <xliff> root node.',
        ParseErrorLevel.WARNING,
      ),
    );
  }

  return {canParse: true, diagnostics, hint: {element: rootElement, errors: xml.errors}};
}

/**
 * Create a predicate, which can be used by things like `Array.filter()`, that will match a named
 * XML Element from a collection of XML Nodes.
 *
 * @param name The expected name of the element to match.
 */
export function isNamedElement(name: string): (node: Node) => node is Element {
  function predicate(node: Node): node is Element {
    return node instanceof Element && node.name === name;
  }
  return predicate;
}

/**
 * Add an XML parser related message to the given `diagnostics` object.
 */
export function addParseDiagnostic(
  diagnostics: Diagnostics,
  sourceSpan: ParseSourceSpan,
  message: string,
  level: ParseErrorLevel,
): void {
  addParseError(diagnostics, new ParseError(sourceSpan, message, level));
}

/**
 * Copy the formatted error message from the given `parseError` object into the given `diagnostics`
 * object.
 */
export function addParseError(diagnostics: Diagnostics, parseError: ParseError): void {
  if (parseError.level === ParseErrorLevel.ERROR) {
    diagnostics.error(parseError.toString());
  } else {
    diagnostics.warn(parseError.toString());
  }
}

/**
 * Add the provided `errors` to the `bundle` diagnostics.
 */
export function addErrorsToBundle(bundle: ParsedTranslationBundle, errors: ParseError[]): void {
  for (const error of errors) {
    addParseError(bundle.diagnostics, error);
  }
}
