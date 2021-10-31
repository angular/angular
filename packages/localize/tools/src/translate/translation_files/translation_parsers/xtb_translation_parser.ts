/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Element, ParseError, ParseErrorLevel, visitAll} from '@angular/compiler';
import {extname} from 'path';

import {Diagnostics} from '../../../diagnostics';
import {BaseVisitor} from '../base_visitor';

import {serializeTranslationMessage} from './serialize_translation_message';
import {ParseAnalysis, ParsedTranslationBundle, TranslationParser} from './translation_parser';
import {addErrorsToBundle, addParseDiagnostic, addParseError, canParseXml, getAttribute, XmlTranslationParserHint} from './translation_utils';


/**
 * A translation parser that can load XTB files.
 *
 * http://cldr.unicode.org/development/development-process/design-proposals/xmb
 *
 * @see XmbTranslationSerializer
 * @publicApi used by CLI
 */
export class XtbTranslationParser implements TranslationParser<XmlTranslationParserHint> {
  /**
   * @deprecated
   */
  canParse(filePath: string, contents: string): XmlTranslationParserHint|false {
    const result = this.analyze(filePath, contents);
    return result.canParse && result.hint;
  }

  analyze(filePath: string, contents: string): ParseAnalysis<XmlTranslationParserHint> {
    const extension = extname(filePath);
    if (extension !== '.xtb' && extension !== '.xmb') {
      const diagnostics = new Diagnostics();
      diagnostics.warn('Must have xtb or xmb extension.');
      return {canParse: false, diagnostics};
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
  override visitElement(element: Element, bundle: ParsedTranslationBundle): any {
    switch (element.name) {
      case 'translation':
        // Error if no `id` attribute
        const id = getAttribute(element, 'id');
        if (id === undefined) {
          addParseDiagnostic(
              bundle.diagnostics, element.sourceSpan,
              `Missing required "id" attribute on <translation> element.`, ParseErrorLevel.ERROR);
          return;
        }

        // Error if there is already a translation with the same id
        if (bundle.translations[id] !== undefined) {
          addParseDiagnostic(
              bundle.diagnostics, element.sourceSpan, `Duplicated translations for message "${id}"`,
              ParseErrorLevel.ERROR);
          return;
        }

        const {translation, parseErrors, serializeErrors} = serializeTranslationMessage(
            element, {inlineElements: [], placeholder: {elementName: 'ph', nameAttribute: 'name'}});
        if (parseErrors.length) {
          // We only want to warn (not error) if there were problems parsing the translation for
          // XTB formatted files. See https://github.com/angular/angular/issues/14046.
          bundle.diagnostics.warn(computeParseWarning(id, parseErrors));
        } else if (translation !== null) {
          // Only store the translation if there were no parse errors
          bundle.translations[id] = translation;
        }
        addErrorsToBundle(bundle, serializeErrors);
        break;

      default:
        addParseDiagnostic(
            bundle.diagnostics, element.sourceSpan, `Unexpected <${element.name}> tag.`,
            ParseErrorLevel.ERROR);
    }
  }
}

function computeParseWarning(id: string, errors: ParseError[]): string {
  const msg = errors.map(e => e.toString()).join('\n');
  return `Could not parse message with id "${id}" - perhaps it has an unrecognised ICU format?\n` +
      msg;
}
