/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** I18n separators for metadata **/
const I18N_MEANING_SEPARATOR = '|';
const I18N_ID_SEPARATOR = '@@';

/** Name of the i18n attributes **/
export const I18N_ATTR = 'i18n';
export const I18N_ATTR_PREFIX = 'i18n-';

/** Placeholder wrapper for i18n expressions **/
export const I18N_PLACEHOLDER_SYMBOL = '�';

// Parse i18n metas like:
// - "@@id",
// - "description[@@id]",
// - "meaning|description[@@id]"
export function parseI18nMeta(i18n?: string):
    {description?: string, id?: string, meaning?: string} {
  let meaning: string|undefined;
  let description: string|undefined;
  let id: string|undefined;

  if (i18n) {
    // TODO(vicb): figure out how to force a message ID with closure ?
    const idIndex = i18n.indexOf(I18N_ID_SEPARATOR);
    const descIndex = i18n.indexOf(I18N_MEANING_SEPARATOR);
    let meaningAndDesc: string;
    [meaningAndDesc, id] =
        (idIndex > -1) ? [i18n.slice(0, idIndex), i18n.slice(idIndex + 2)] : [i18n, ''];
    [meaning, description] = (descIndex > -1) ?
        [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)] :
        ['', meaningAndDesc];
  }

  return {description, id, meaning};
}

export function isI18NAttribute(name: string): boolean {
  return name === I18N_ATTR || name.startsWith(I18N_ATTR_PREFIX);
}

export function wrapI18nPlaceholder(content: string | number): string {
  return `${I18N_PLACEHOLDER_SYMBOL}${content}${I18N_PLACEHOLDER_SYMBOL}`;
}

export function assembleI18nTemplate(strings: Array<string>): string {
  if (!strings.length) return '';
  let acc = '';
  const lastIdx = strings.length - 1;
  for (let i = 0; i < lastIdx; i++) {
    acc += `${strings[i]}${wrapI18nPlaceholder(i)}`;
  }
  acc += strings[lastIdx];
  return acc;
}

function getSeqNubmerGenerator(startsAt: number = 0): () => number {
  let current = startsAt;
  return () => current++;
}
export class I18nContext {
  private id: number;
  private content: string = '';

  constructor(
      private index: number, private templateIndex: number|null = null, private ref: any,
      private level: number = 0, private uniqueIdGen?: (() => number)) {
    this.uniqueIdGen = uniqueIdGen || getSeqNubmerGenerator();
    this.id = this.uniqueIdGen();
  }

  private wrap(symbol: string, elementIndex: number, contextIdx: number|null, closed?: boolean) {
    const state = closed ? '/' : '';
    const blockIndex = contextIdx && contextIdx > 0 ? `:${contextIdx}` : '';
    return wrapI18nPlaceholder(`${state}${symbol}${elementIndex}${blockIndex}`);
  }
  private append(content: string) { this.content += content; }

  getId() { return this.id; }
  getRef() { return this.ref; }
  getIndex() { return this.index; }
  getLevel() { return this.level; }
  getContent() { return this.content; }
  getTemplateIndex() { return this.templateIndex; }

  appendText(content: string) { this.append(content); }
  appendTemplate(index: number) { this.append(`[tmpl:${this.id}:${index}]`); }
  appendElement(elementIndex: number, closed?: boolean) {
    this.append(this.wrap('#', elementIndex, this.id, closed));
  }

  resolved() { return !/\[tmpl:\d+:\d+\]/.test(this.content); }
  forkChildContext(index: number, templateIndex: number) {
    return new I18nContext(index, templateIndex, this.ref, this.level + 1, this.uniqueIdGen);
  }
  reconcileChildContext(context: I18nContext) {
    const id = context.getId();
    const content = context.getContent();
    const templateIndex = context.getTemplateIndex() !;
    const pattern = new RegExp(`\\[tmpl\\:${this.id}\\:${templateIndex}\\]`);
    const replacement =
        `${this.wrap('*', templateIndex, id)}${content}${this.wrap('*', templateIndex, id, true)}`;
    this.content = this.content.replace(pattern, replacement);
  }
}