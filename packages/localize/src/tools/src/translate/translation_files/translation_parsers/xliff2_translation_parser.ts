/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Element, Node, ParseErrorLevel, visitAll} from '@angular/compiler';
import {ɵParsedTranslation} from '@angular/localize';

import {Diagnostics} from '../../../diagnostics';
import {BaseVisitor} from '../base_visitor';
import {MessageSerializer} from '../message_serialization/message_serializer';
import {TargetMessageRenderer} from '../message_serialization/target_message_renderer';

import {ParsedTranslationBundle, TranslationParser} from './translation_parser';
import {XmlTranslationParserHint, addParseDiagnostic, addParseError, canParseXml, getAttribute, isNamedElement, parseInnerRange} from './translation_utils';

/**
 * A translation parser that can load translations from XLIFF 2 files.
 *
 * http://docs.oasis-open.org/xliff/xliff-core/v2.0/os/xliff-core-v2.0-os.html
 *
 */
export class Xliff2TranslationParser implements TranslationParser<XmlTranslationParserHint> {
  canParse(filePath: string, contents: string): XmlTranslationParserHint|false {
    return canParseXml(filePath, contents, 'xliff', {version: '2.0'});
  }

  parse(filePath: string, contents: string, hint?: XmlTranslationParserHint):
      ParsedTranslationBundle {
    if (hint) {
      return this.extractBundle(hint);
    } else {
      return this.extractBundleDeprecated(filePath, contents);
    }
  }

  private extractBundle({element, errors}: XmlTranslationParserHint): ParsedTranslationBundle {
    const diagnostics = new Diagnostics();
    errors.forEach(e => addParseError(diagnostics, e));

    if (element.children.length === 0) {
      addParseDiagnostic(
          diagnostics, element.sourceSpan, 'Missing expected <file> element',
          ParseErrorLevel.WARNING);
      return {locale: undefined, translations: {}, diagnostics};
    }

    const locale = getAttribute(element, 'trgLang');
    const files = element.children.filter(isFileElement);
    if (files.length === 0) {
      addParseDiagnostic(
          diagnostics, element.sourceSpan, 'No <file> elements found in <xliff>',
          ParseErrorLevel.WARNING);
    } else if (files.length > 1) {
      addParseDiagnostic(
          diagnostics, files[1].sourceSpan, 'More than one <file> element found in <xliff>',
          ParseErrorLevel.WARNING);
    }

    const bundle = {locale, translations: {}, diagnostics};
    const translationVisitor = new Xliff2TranslationVisitor();
    visitAll(translationVisitor, files[0].children, {bundle});

    return bundle;
  }

  private extractBundleDeprecated(filePath: string, contents: string) {
    const hint = this.canParse(filePath, contents);
    if (!hint) {
      throw new Error(`Unable to parse "${filePath}" as XLIFF 2.0 format.`);
    }
    const bundle = this.extractBundle(hint);
    if (bundle.diagnostics.hasErrors) {
      const message =
          bundle.diagnostics.formatDiagnostics(`Failed to parse "${filePath}" as XLIFF 2.0 format`);
      throw new Error(message);
    }
    return bundle;
  }
}


interface TranslationVisitorContext {
  unit?: string;
  bundle: ParsedTranslationBundle;
}

class Xliff2TranslationVisitor extends BaseVisitor {
  visitElement(element: Element, {bundle, unit}: TranslationVisitorContext): any {
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
          bundle.diagnostics, element.sourceSpan,
          `Missing required "id" attribute on <trans-unit> element.`, ParseErrorLevel.ERROR);
      return;
    }

    // Error if there is already a translation with the same id
    if (bundle.translations[externalId] !== undefined) {
      addParseDiagnostic(
          bundle.diagnostics, element.sourceSpan,
          `Duplicated translations for message "${externalId}"`, ParseErrorLevel.ERROR);
      return;
    }

    visitAll(this, element.children, {bundle, unit: externalId});
  }

  private visitSegmentElement(
      element: Element, bundle: ParsedTranslationBundle, unit: string|undefined): void {
    // A `<segment>` element must be below a `<unit>` element
    if (unit === undefined) {
      addParseDiagnostic(
          bundle.diagnostics, element.sourceSpan,
          'Invalid <segment> element: should be a child of a <unit> element.',
          ParseErrorLevel.ERROR);
      return;
    }

    const targetMessage = element.children.find(isNamedElement('target'));
    if (targetMessage === undefined) {
      addParseDiagnostic(
          bundle.diagnostics, element.sourceSpan, 'Missing required <target> element',
          ParseErrorLevel.ERROR);
      return;
    }

    try {
      bundle.translations[unit] = serializeTargetMessage(targetMessage);
    } catch (e) {
      // Capture any errors from serialize the target message
      if (e.span && e.msg && e.level) {
        addParseDiagnostic(bundle.diagnostics, e.span, e.msg, e.level);
      } else {
        throw e;
      }
    }
  }
}

function serializeTargetMessage(source: Element): ɵParsedTranslation {
  const serializer = new MessageSerializer(new TargetMessageRenderer(), {
    inlineElements: ['cp', 'sc', 'ec', 'mrk', 'sm', 'em'],
    placeholder: {elementName: 'ph', nameAttribute: 'equiv', bodyAttribute: 'disp'},
    placeholderContainer:
        {elementName: 'pc', startAttribute: 'equivStart', endAttribute: 'equivEnd'}
  });
  return serializer.serialize(parseInnerRange(source));
}

function isFileElement(node: Node): node is Element {
  return node instanceof Element && node.name === 'file';
}
