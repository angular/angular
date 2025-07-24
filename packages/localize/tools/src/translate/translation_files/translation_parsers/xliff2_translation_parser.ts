/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Element, Node, ParseErrorLevel, visitAll} from '@angular/compiler';

import {Diagnostics} from '../../../diagnostics';
import {BaseVisitor} from '../base_visitor';

import {serializeTranslationMessage} from './serialize_translation_message';
import {ParseAnalysis, ParsedTranslationBundle, TranslationParser} from './translation_parser';
import {
  addErrorsToBundle,
  addParseDiagnostic,
  addParseError,
  canParseXml,
  getAttribute,
  isNamedElement,
  XmlTranslationParserHint,
} from './translation_utils';

/**
 * A translation parser that can load translations from XLIFF 2 files.
 *
 * https://docs.oasis-open.org/xliff/xliff-core/v2.0/os/xliff-core-v2.0-os.html
 *
 * @see Xliff2TranslationSerializer
 * @publicApi used by CLI
 */
export class Xliff2TranslationParser implements TranslationParser<XmlTranslationParserHint> {
  analyze(filePath: string, contents: string): ParseAnalysis<XmlTranslationParserHint> {
    return canParseXml(filePath, contents, 'xliff', {version: '2.0'});
  }

  parse(
    filePath: string,
    contents: string,
    hint: XmlTranslationParserHint,
  ): ParsedTranslationBundle {
    return this.extractBundle(hint);
  }

  private extractBundle({element, errors}: XmlTranslationParserHint): ParsedTranslationBundle {
    const diagnostics = new Diagnostics();
    errors.forEach((e) => addParseError(diagnostics, e));

    const locale = getAttribute(element, 'trgLang');
    const files = element.children.filter(isFileElement);
    if (files.length === 0) {
      addParseDiagnostic(
        diagnostics,
        element.sourceSpan,
        'No <file> elements found in <xliff>',
        ParseErrorLevel.WARNING,
      );
    } else if (files.length > 1) {
      addParseDiagnostic(
        diagnostics,
        files[1].sourceSpan,
        'More than one <file> element found in <xliff>',
        ParseErrorLevel.WARNING,
      );
    }

    const bundle = {locale, translations: {}, diagnostics};
    const translationVisitor = new Xliff2TranslationVisitor();
    for (const file of files) {
      visitAll(translationVisitor, file.children, {bundle});
    }
    return bundle;
  }
}

interface TranslationVisitorContext {
  unit?: string;
  bundle: ParsedTranslationBundle;
}

class Xliff2TranslationVisitor extends BaseVisitor {
  override visitElement(element: Element, {bundle, unit}: TranslationVisitorContext): any {
    if (element.name === 'unit') {
      this.visitUnitElement(element, bundle);
    } else if (element.name === 'segment') {
      this.visitSegmentElement(element, bundle, unit);
    } else {
      visitAll(this, element.children, {bundle, unit});
    }
  }

  private visitUnitElement(element: Element, bundle: ParsedTranslationBundle): void {
    // Error if no `id` attribute
    const externalId = getAttribute(element, 'id');
    if (externalId === undefined) {
      addParseDiagnostic(
        bundle.diagnostics,
        element.sourceSpan,
        `Missing required "id" attribute on <trans-unit> element.`,
        ParseErrorLevel.ERROR,
      );
      return;
    }

    // Error if there is already a translation with the same id
    if (bundle.translations[externalId] !== undefined) {
      addParseDiagnostic(
        bundle.diagnostics,
        element.sourceSpan,
        `Duplicated translations for message "${externalId}"`,
        ParseErrorLevel.ERROR,
      );
      return;
    }

    visitAll(this, element.children, {bundle, unit: externalId});
  }

  private visitSegmentElement(
    element: Element,
    bundle: ParsedTranslationBundle,
    unit: string | undefined,
  ): void {
    // A `<segment>` element must be below a `<unit>` element
    if (unit === undefined) {
      addParseDiagnostic(
        bundle.diagnostics,
        element.sourceSpan,
        'Invalid <segment> element: should be a child of a <unit> element.',
        ParseErrorLevel.ERROR,
      );
      return;
    }

    let targetMessage = element.children.find(isNamedElement('target'));
    if (targetMessage === undefined) {
      // Warn if there is no `<target>` child element
      addParseDiagnostic(
        bundle.diagnostics,
        element.sourceSpan,
        'Missing <target> element',
        ParseErrorLevel.WARNING,
      );

      // Fallback to the `<source>` element if available.
      targetMessage = element.children.find(isNamedElement('source'));
      if (targetMessage === undefined) {
        // Error if there is neither `<target>` nor `<source>`.
        addParseDiagnostic(
          bundle.diagnostics,
          element.sourceSpan,
          'Missing required element: one of <target> or <source> is required',
          ParseErrorLevel.ERROR,
        );
        return;
      }
    }

    const {translation, parseErrors, serializeErrors} = serializeTranslationMessage(targetMessage, {
      inlineElements: ['cp', 'sc', 'ec', 'mrk', 'sm', 'em'],
      placeholder: {elementName: 'ph', nameAttribute: 'equiv', bodyAttribute: 'disp'},
      placeholderContainer: {
        elementName: 'pc',
        startAttribute: 'equivStart',
        endAttribute: 'equivEnd',
      },
    });
    if (translation !== null) {
      bundle.translations[unit] = translation;
    }
    addErrorsToBundle(bundle, parseErrors);
    addErrorsToBundle(bundle, serializeErrors);
  }
}

function isFileElement(node: Node): node is Element {
  return node instanceof Element && node.name === 'file';
}
