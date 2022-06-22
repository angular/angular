/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as i18n from '../../../i18n/i18n_ast';

import {formatI18nPlaceholderName} from './util';

class IcuSerializerVisitor implements i18n.Visitor {
  constructor(private readonly localizer: Localizer) {}

  visitText(text: i18n.Text): any {
    return text.value;
  }

  visitContainer(container: i18n.Container): any {
    return container.children.map(child => child.visit(this)).join('');
  }

  visitIcu(icu: i18n.Icu): any {
    const strCases =
        Object.keys(icu.cases).map((k: string) => `${k} {${icu.cases[k].visit(this)}}`);
    const result = `{${icu.expressionPlaceholder}, ${icu.type}, ${strCases.join(' ')}}`;
    return result;
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder): any {
    return ph.isVoid ?
        this.formatPh(ph.startName) :
        `${this.formatPh(ph.startName)}${ph.children.map(child => child.visit(this)).join('')}${
            this.formatPh(ph.closeName)}`;
  }

  visitPlaceholder(ph: i18n.Placeholder): any {
    return this.formatPh(ph.name);
  }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): any {
    return this.formatPh(ph.name);
  }

  private formatPh(value: string): string {
    switch (this.localizer) {
      case Localizer.$Localize:
        // Use an ICU placeholder.
        return `{${formatI18nPlaceholderName(value, /* useCamelCase */ false)}}`;
      case Localizer.GetMsg:
        // `goog.getMsg()` ICU strings still use typical `goog.getMsg()` placeholders, which
        // evaluate to ICU placeholders like so:
        // const MSG_FOO = goog.getMsg('Some {$interpolation}', {'interpolation':
        // '{interpolation}'});
        //
        // This replaces the `goog.getMsg()` placeholder with the ICU placeholder, and the runtime
        // sees a typical ICU placeholder:
        // const MSG_FOO = 'Some {interpolation}';
        //
        // This allows the message to still work with ICU's, but also all placeholders pass through
        // `goog.getMsg()` placeholders, meaning JSCompiler has knowledge of them and will extract
        // then just like any other message placeholder.
        // See http://b/214103351#comment32 and http://b/214103351#comment33.
        return `{$${formatI18nPlaceholderName(value, /* useCamelCase */ true)}}`;
      default:
        return assertNever(this.localizer);
    }
  }
}

function assertNever(input: never): never {
  throw new Error(`Unexpected call to \`assertNever()\` with value:\n${input}`);
}

export function serializeIcuNode(icu: i18n.Icu, localizer: Localizer): string {
  const serializer = new IcuSerializerVisitor(localizer);
  return icu.visit(serializer);
}

export enum Localizer {
  $Localize = '$localize',
  GetMsg = 'goog.getMsg',
}
