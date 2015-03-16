import {describe, beforeEach, it, expect, ddescribe, iit, SpyObject, el, proxy} from 'angular2/test_lib';
import {IMPLEMENTS} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Content} from 'angular2/src/core/compiler/shadow_dom_emulation/content_tag';
import {LightDom} from 'angular2/src/core/compiler/shadow_dom_emulation/light_dom';

@proxy
@IMPLEMENTS(LightDom)
class DummyLightDom extends SpyObject {noSuchMethod(m){super.noSuchMethod(m)}}

var _scriptStart = `<script start=""></script>`;
var _scriptEnd = `<script end=""></script>`;

export function main() {
  describe('Content', function() {
    var parent;
    var content;

    beforeEach(() => {
      parent = el(`<div>${_scriptStart}${_scriptEnd}`);
      content = DOM.firstChild(parent);
    });

    it("should insert the nodes", () => {
      var c = new Content(null, content, '');
      c.insert([el("<a></a>"), el("<b></b>")])

      expect(DOM.getInnerHTML(parent)).toEqual(`${_scriptStart}<a></a><b></b>${_scriptEnd}`);
    });

    it("should remove the nodes from the previous insertion", () => {
      var c = new Content(null, content, '');
      c.insert([el("<a></a>")]);
      c.insert([el("<b></b>")]);

      expect(DOM.getInnerHTML(parent)).toEqual(`${_scriptStart}<b></b>${_scriptEnd}`);
    });

    it("should insert empty list", () => {
      var c = new Content(null, content, '');
      c.insert([el("<a></a>")]);
      c.insert([]);

      expect(DOM.getInnerHTML(parent)).toEqual(`${_scriptStart}${_scriptEnd}`);
    });
  });
}
