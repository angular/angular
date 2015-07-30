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
import {
  prepareTemplateForClone,
  ReferenceCloneableTemplate,
  SerializedCloneableTemplate
} from 'angular2/src/render/dom/util';

export function main() {
  describe('Dom util', () => {

    describe('prepareTemplateForClone', () => {
      it('should use a reference for small templates', () => {
        var t = DOM.createTemplate('');
        var ct = prepareTemplateForClone(t);
        expect((<ReferenceCloneableTemplate>ct).templateRoot).toBe(t);
      });

      it('should use a reference for big templates with a force comment', () => {
        var templateString = '<!--cache-->';
        for (var i = 0; i < 100; i++) {
          templateString += '<div></div>';
        }
        var t = DOM.createTemplate(templateString);
        var ct = prepareTemplateForClone(t);
        expect((<ReferenceCloneableTemplate>ct).templateRoot).toBe(t);
      });

      it('should serialize for big templates', () => {
        var templateString = '';
        for (var i = 0; i < 100; i++) {
          templateString += '<div></div>';
        }
        var t = DOM.createTemplate(templateString);
        var ct = prepareTemplateForClone(t);
        expect((<SerializedCloneableTemplate>ct).templateString).toEqual(templateString);
      });

      it('should serialize for templates with the force comment', () => {
        var templateString = '<!--nocache-->';
        var t = DOM.createTemplate(templateString);
        var ct = prepareTemplateForClone(t);
        expect((<SerializedCloneableTemplate>ct).templateString).toEqual(templateString);
      });
    });

    describe('ReferenceCloneableTemplate', () => {
      it('should return template.content nodes (no import)', () => {
        var t = DOM.createTemplate('a');
        var ct = new ReferenceCloneableTemplate(t);
        var clone = ct.clone(false);
        expect(clone).not.toBe(DOM.content(t));
        expect(DOM.getText(DOM.firstChild(clone))).toEqual('a');
      });

      it('should return template.content nodes (import into doc)', () => {
        var t = DOM.createTemplate('a');
        var ct = new ReferenceCloneableTemplate(t);
        var clone = ct.clone(true);
        expect(clone).not.toBe(DOM.content(t));
        expect(DOM.getText(DOM.firstChild(clone))).toEqual('a');
      });
    });

    describe('SerializedCloneableTemplate', () => {
      it('should return template.content nodes (no import)', () => {
        var t = DOM.createTemplate('a');
        var ct = new SerializedCloneableTemplate(t);
        var clone = ct.clone(false);
        expect(clone).not.toBe(DOM.content(t));
        expect(DOM.getText(DOM.firstChild(clone))).toEqual('a');
      });

      it('should return template.content nodes (import into doc)', () => {
        var t = DOM.createTemplate('a');
        var ct = new SerializedCloneableTemplate(t);
        var clone = ct.clone(true);
        expect(clone).not.toBe(DOM.content(t));
        expect(DOM.getText(DOM.firstChild(clone))).toEqual('a');
      });
    });
  });
}