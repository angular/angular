/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Element, ParseErrorLevel, visitAll} from '@angular/compiler';
import {ɵParsedTranslation} from '@angular/localize';
import {extname} from 'path';

import {Diagnostics} from '../../../diagnostics';
import {BaseVisitor} from '../base_visitor';
import {MessageSerializer} from '../message_serialization/message_serializer';
import {TargetMessageRenderer} from '../message_serialization/target_message_renderer';

import {ParsedTranslationBundle, TranslationParser} from './translation_parser';
import {addParseDiagnostic, addParseError, canParseXml, getAttribute, parseInnerRange, XmlTranslationParserHint} from './translation_utils';


/**
 * A translation parser that can load XB files.
 */
export class XtbTranslationParser implements TranslationParser<XmlTranslationParserHint> {
  canParse(filePath: string, contents: string): XmlTranslationParserHint|false {
    const extension = extname(filePath);
    if (extension !== '.xtb' && extension !== '.xmb') {
      return false;
    }
    return canParseXml(filePath, contents, 'translationbundle', {});
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
    const langAttr = element.attrs.find((attr) => attr.name === 'lang');
    const bundle: ParsedTranslationBundle = {
      locale: langAttr && langAttr.value,
      translations: {},
      diagnostics: new Diagnostics()
    };
    errors.forEach(e => addParseError(bundle.diagnostics, e));

    const bundleVisitor = new XtbVisitor();
    visitAll(bundleVisitor, element.children, bundle);
    return bundle;
  }

  private extractBundleDeprecated(filePath: string, contents: string) {
    const hint = this.canParse(filePath, contents);
    if (!hint) {
      throw new Error(`Unable to parse "${filePath}" as XMB/XTB format.`);
    }
    const bundle = this.extractBundle(hint);
    if (bundle.diagnostics.hasErrors) {
      const message =
          bundle.diagnostics.formatDiagnostics(`Failed to parse "${filePath}" as XMB/XTB format`);
      throw new Error(message);
    }
    return bundle;
  }
}

class XtbVisitor extends BaseVisitor {
  visitElement(element: Element, bundle: ParsedTranslationBundle): any {
    switch (element.name) {
      case 'translation':
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

        try {
          bundle.translations[id] = serializeTargetMessage(element);
        } catch (error) {
          if (typeof error === 'string') {
            bundle.diagnostics.warn(
                `Could not parse message with id "${
                    id}" - perhaps it has an unrecognised ICU format?\n` +
                error);
          } else if (error.span && error.msg && error.level) {
            addParseDiagnostic(bundle.diagnostics, error.span, error.msg, error.level);
          } else {
            throw error;
          }
        }
        break;

      default:
        addParseDiagnostic(
            bundle.diagnostics, element.sourceSpan, `Unexpected <${element.name}> tag.`,
            ParseErrorLevel.ERROR);
    }
  }
}

function serializeTargetMessage(source: Element): ɵParsedTranslation {
  const serializer = new MessageSerializer(
      new TargetMessageRenderer(),
      {inlineElements: [], placeholder: {elementName: 'ph', nameAttribute: 'name'}});
  return serializer.serialize(parseInnerRange(source));
}
