import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  dispatchEvent,
  expect,
  iit,
  inject,
  beforeEachBindings,
  it,
  xit,
  SpyObject,
  proxy
} from 'angular2/test_lib';

import {DOM} from 'angular2/src/dom/dom_adapter';
import {DomSharedStylesHost} from 'angular2/src/render/dom/view/shared_styles_host';

export function main() {
  describe('DomSharedStylesHost', () => {
    var doc;
    var ssh: DomSharedStylesHost;
    var someHost: Element;
    beforeEach(() => {
      doc = DOM.createHtmlDocument();
      doc.title = '';
      ssh = new DomSharedStylesHost(doc);
      someHost = DOM.createElement('div');
    });

    it('should add existing styles to new hosts', () => {
      ssh.addStyles(['a {};']);
      ssh.addHost(someHost);
      expect(DOM.getInnerHTML(someHost)).toEqual('<style>a {};</style>');
    });

    it('should add new styles to hosts', () => {
      ssh.addHost(someHost);
      ssh.addStyles(['a {};']);
      expect(DOM.getInnerHTML(someHost)).toEqual('<style>a {};</style>');
    });

    it('should add styles only once to hosts', () => {
      ssh.addStyles(['a {};']);
      ssh.addHost(someHost);
      ssh.addStyles(['a {};']);
      expect(DOM.getInnerHTML(someHost)).toEqual('<style>a {};</style>');
    });

    it('should use the document head as default host', () => {
      ssh.addStyles(['a {};', 'b {};']);
      expect(doc.head).toHaveText('a {};b {};');
    });
  });
}