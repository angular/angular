import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
  beforeEachBindings,
  SpyObject,
} from 'angular2/test_lib';

import {DOM} from 'angular2/src/dom/dom_adapter';
import {TemplateCloner} from 'angular2/src/render/dom/template_cloner';

export function main() {
  describe('TemplateCloner', () => {
    var cloner: TemplateCloner;
    var bigTemplate: Element;
    var smallTemplate: Element;

    beforeEach(() => {
      cloner = new TemplateCloner(1);
      bigTemplate = DOM.createTemplate('a<div></div>');
      smallTemplate = DOM.createTemplate('a');
    });

    describe('prepareForClone', () => {
      it('should use a reference for small templates',
         () => { expect(cloner.prepareForClone(smallTemplate)).toBe(smallTemplate); });

      it('should use a reference if the max element count is -1', () => {
        cloner = new TemplateCloner(-1);
        expect(cloner.prepareForClone(bigTemplate)).toBe(bigTemplate);
      });

      it('should use a string for big templates', () => {
        expect(cloner.prepareForClone(bigTemplate)).toEqual(DOM.getInnerHTML(bigTemplate));
      });
    });

    describe('cloneTemplate', () => {

      function shouldReturnTemplateContentNodes(template: Element, importIntoDoc: boolean) {
        var clone = cloner.cloneContent(cloner.prepareForClone(template), importIntoDoc);
        expect(clone).not.toBe(DOM.content(template));
        expect(DOM.getText(DOM.firstChild(clone))).toEqual('a');
      }

      it('should return template.content nodes (small template, no import)',
         () => { shouldReturnTemplateContentNodes(smallTemplate, false); });

      it('should return template.content nodes (small template, import)',
         () => { shouldReturnTemplateContentNodes(smallTemplate, true); });

      it('should return template.content nodes (big template, no import)',
         () => { shouldReturnTemplateContentNodes(bigTemplate, false); });

      it('should return template.content nodes (big template, import)',
         () => { shouldReturnTemplateContentNodes(bigTemplate, true); });
    });

  });
}