/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Element, ParseErrorLevel, visitAll} from '@angular/compiler';
import {ɵParsedTranslation} from '@angular/localize';

import {Diagnostics} from '../../../diagnostics';
import {BaseVisitor} from '../base_visitor';
import {MessageSerializer} from '../message_serialization/message_serializer';
import {TargetMessageRenderer} from '../message_serialization/target_message_renderer';

import {ParsedTranslationBundle, TranslationParser} from './translation_parser';
import {XmlTranslationParserHint, addParseDiagnostic, addParseError, canParseXml, getAttribute, isNamedElement, parseInnerRange} from './translation_utils';

/**
 * A translation parser that can load XLIFF 1.2 files.
 *
 * http://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html
 * http://docs.oasis-open.org/xliff/v1.2/xliff-profile-html/xliff-profile-html-1.2.html
 *
 */
export class Xliff1TranslationParser implements TranslationParser<XmlTranslationParserHint> {
  canParse(filePath: string, contents: string): XmlTranslationParserHint|false {
    return canParseXml(filePath, contents, 'xliff', {version: '1.2'});
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

    const files = element.children.filter(isNamedElement('file'));
    if (files.length === 0) {
      addParseDiagnostic(
          diagnostics, element.sourceSpan, 'No <file> elements found in <xliff>',
          ParseErrorLevel.WARNING);
    } else if (files.length > 1) {
      addParseDiagnostic(
          diagnostics, files[1].sourceSpan, 'More than one <file> element found in <xliff>',
          ParseErrorLevel.WARNING);
    }

    const bundle = {
      locale: getAttribute(files[0], 'target-language'),
      translations: {}, diagnostics,
    };
    const translationVisitor = new XliffTranslationVisitor();
    visitAll(translationVisitor, files[0].children, bundle);

    return bundle;
  }

  private extractBundleDeprecated(filePath: string, contents: string) {
    const hint = this.canParse(filePath, contents);
    if (!hint) {
      throw new Error(`Unable to parse "${filePath}" as XLIFF 1.2 format.`);
    }
    const bundle = this.extractBundle(hint);
    if (bundle.diagnostics.hasErrors) {
      const message =
          bundle.diagnostics.formatDiagnostics(`Failed to parse "${filePath}" as XLIFF 1.2 format`);
      throw new Error(message);
    }
    return bundle;
  }
}

class XliffFileElementVisitor extends BaseVisitor {
  visitElement(fileElement: Element): any {
    if (fileElement.name === 'file') {
      return {fileElement, locale: getAttribute(fileElement, 'target-language')};
    }
  }
}

class XliffTranslationVisitor extends BaseVisitor {
  visitElement(element: Element, bundle: ParsedTranslationBundle): void {
    if (element.name === 'trans-unit') {
      this.visitTransUnitElement(element, bundle);
    } else {
      visitAll(this, element.children, bundle);
    }
  }

  private visitTransUnitElement(element: Element, bundle: ParsedTranslationBundle): void {
    // Error if no `id` attribute
    const id = getAttribute(element, 'id');
    if (id === undefined) {
      addParseDiagnostic(
          bundle.diagnostics, element.sourceSpan,
          `Missing required "id" attribute on <trans-unit> element.`, ParseErrorLevel.ERROR);
      return;
    }

    // Error if there is already a translation with the same id
    if (bundle.translations[id] !== undefined) {
      addParseDiagnostic(
          bundle.diagnostics, element.sourceSpan, `Duplicated translations for message "${id}"`,
          ParseErrorLevel.ERROR);
      return;
    }

    // Error if there is no `<target>` child element
    const targetMessage = element.children.find(isNamedElement('target'));
    if (targetMessage === undefined) {
      addParseDiagnostic(
          bundle.diagnostics, element.sourceSpan, 'Missing required <target> element',
          ParseErrorLevel.ERROR);
      return;
    }

    try {
      bundle.translations[id] = serializeTargetMessage(targetMessage);
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
    inlineElements: ['g', 'bx', 'ex', 'bpt', 'ept', 'ph', 'it', 'mrk'],
    placeholder: {elementName: 'x', nameAttribute: 'id'}
  });
  return serializer.serialize(parseInnerRange(source));
}
