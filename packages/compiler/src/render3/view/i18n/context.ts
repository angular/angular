/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../output/output_ast';
import * as t from '../../r3_ast';

import {I18nMeta} from './meta';
import {assembleBoundTextPlaceholders, getSeqNumberGenerator, updatePlaceholderMap, wrapI18nPlaceholder} from './util';

enum TagType {
  ELEMENT,
  TEMPLATE
}

/**
 * I18nContext is a helper class which keeps track of all i18n-related aspects
 * (accumulates content, bindings, etc) between i18nStart and i18nEnd instructions.
 *
 * When we enter a nested template, the top-level context is being passed down
 * to the nested component, which uses this context to generate a child instance
 * of I18nContext class (to handle nested template) and at the end, reconciles it back
 * with the parent context.
 */
export class I18nContext {
  private id: number;
  private bindings = new Set<o.Expression>();
  private placeholders = new Map<string, any[]>();
  private registry !: any;
  private unresolvedCtxCount: number = 0;

  constructor(
      private index: number, private ref: o.ReadVarExpr, private level: number = 0,
      private templateIndex: number|null = null, private meta: I18nMeta,
      private registryInstance?: any) {
    this.registry = registryInstance || this.setupRegistry();
    this.id = this.registry.getUniqueId();
  }

  private setupRegistry() {
    return {getUniqueId: getSeqNumberGenerator(), icus: new Map<string, any[]>()};
  }
  private appendTag(type: TagType, element: any, index: number, closed?: boolean) {
    const {ast} = element.i18n;
    if (ast.isVoid && closed) {
      return;  // ignore "close" for void tags
    }
    const ph = ast.isVoid || !closed ? ast.startName : ast.closeName;
    const content = {type, index, ctx: this.id, isVoid: ast.isVoid, closed};
    updatePlaceholderMap(this.placeholders, ph, content);
  }

  getId() { return this.id; }
  getRef() { return this.ref; }
  getIndex() { return this.index; }
  getMeta() { return this.meta; }
  getIcus() { return this.registry.icus; }
  getTemplateIndex() { return this.templateIndex; }
  getBindings() { return this.bindings; }
  getRawPlaceholders() { return this.placeholders; }
  getPlaceholders() {
    const result = new Map<string, any[]>();
    this.placeholders.forEach(
        (values, key) => result.set(key, values.map(serializePlaceholderValue)));
    return result;
  }

  isRoot() { return this.level === 0; }
  isResolved() { return this.unresolvedCtxCount === 0; }

  appendBinding(binding: o.Expression) { this.bindings.add(binding); }
  appendIcu(expansion: t.Expansion, ref: o.Expression) {
    const {name} = expansion.i18n !.ast;
    updatePlaceholderMap(this.registry.icus, name, ref);
  }
  appendBoundText(element: t.BoundText) {
    const phs = assembleBoundTextPlaceholders(element.i18n !, this.bindings.size, this.id);
    phs.forEach((values, key) => updatePlaceholderMap(this.placeholders, key, ...values));
  }
  appendTemplate(element: t.Template, index: number) {
    // add open and close tags at the same time,
    // since we process nested templates separately
    this.appendTag(TagType.TEMPLATE, element, index, false);
    this.appendTag(TagType.TEMPLATE, element, index, true);
    this.unresolvedCtxCount++;
  }
  appendElement(element: t.Element, index: number, closed?: boolean) {
    this.appendTag(TagType.ELEMENT, element, index, closed);
  }

  forkChildContext(index: number, templateIndex: number, meta: I18nMeta) {
    return new I18nContext(index, this.ref, this.level + 1, templateIndex, meta, this.registry);
  }
  reconcileChildContext(context: I18nContext) {
    const meta = context.getMeta();

    // set the right context id for open and close
    // template tags, so we can use it as sub-block ids
    ['start', 'close'].forEach((op: string) => {
      const key = meta.ast[`${op}Name`];
      const phs = this.placeholders.get(key) || [];
      const tag = phs.find(findTemplateFn(this.id, context.getTemplateIndex()));
      if (tag) {
        tag.ctx = context.getId();
      }
    });

    // reconcile placeholders
    const childPhs = context.getRawPlaceholders();
    childPhs.forEach((values: any[], key: string) => {
      const phs = this.placeholders.get(key);
      if (!phs) {
        this.placeholders.set(key, values);
        return;
      }
      // try to find matching template...
      const tmplIdx = phs.findIndex(findTemplateFn(context.getId(), context.getTemplateIndex()));
      if (tmplIdx >= 0) {
        // ... if found - replace it with nested template content
        const isCloseTag = key.startsWith('CLOSE');
        const isTemplateTag = key.endsWith('NG-TEMPLATE');
        if (isTemplateTag) {
          // current template's content is placed before or after
          // parent template tag, depending on the open/close atrribute
          phs.splice(tmplIdx + (isCloseTag ? 0 : 1), 0, ...values);
        } else {
          const idx = isCloseTag ? values.length - 1 : 0;
          values[idx].tmpl = phs[tmplIdx];
          phs.splice(tmplIdx, 1, ...values);
        }
      } else {
        // ... otherwise just append content to placeholder value
        phs.push(...values);
      }
      this.placeholders.set(key, phs);
    });
    this.unresolvedCtxCount--;
  }
}

//
// Helper methods
//

function wrap(symbol: string, index: number, contextId: number, closed?: boolean): string {
  const state = closed ? '/' : '';
  return wrapI18nPlaceholder(`${state}${symbol}${index}`, contextId);
}

function wrapTag(symbol: string, {index, ctx, isVoid}: any, closed?: boolean): string {
  return isVoid ? wrap(symbol, index, ctx) + wrap(symbol, index, ctx, true) :
                  wrap(symbol, index, ctx, closed);
}

function findTemplateFn(ctx: number, templateIndex: number | null) {
  return (token: any) =>
             token.type === TagType.TEMPLATE && token.index === templateIndex && token.ctx === ctx;
}

function serializePlaceholderValue(value: any): string {
  const element = (data: any, closed?: boolean) => wrapTag('#', data, closed);
  const template = (data: any, closed?: boolean) => wrapTag('*', data, closed);

  switch (value.type) {
    case TagType.ELEMENT:
      // close element tag
      if (value.closed) {
        return element(value, true) + (value.tmpl ? template(value.tmpl, true) : '');
      }
      // open element tag that also initiates a template
      if (value.tmpl) {
        return template(value.tmpl) + element(value) +
            (value.isVoid ? template(value.tmpl, true) : '');
      }
      return element(value);

    case TagType.TEMPLATE:
      return template(value, value.closed);

    default:
      return value;
  }
}
