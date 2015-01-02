import {describe, beforeEach, it, expect, ddescribe, iit, SpyObject} from 'test_lib/test_lib';
import {proxy, IMPLEMENTS} from 'facade/lang';
import {DOM} from 'facade/dom';
import {Content} from 'core/compiler/shadow_dom_emulation/content_tag';
import {NgElement} from 'core/dom/element';
import {LightDom} from 'core/compiler/shadow_dom_emulation/light_dom';

@proxy
@IMPLEMENTS(LightDom)
class DummyLightDom extends SpyObject {noSuchMethod(m){super.noSuchMethod(m)}}

var _script = `<script type="ng/content"></script>`;

export function main() {
  describe('Content', function() {
    it("should insert the nodes", () => {
      var lightDom = new DummyLightDom();
      var parent = createElement("<div><content></content></div>");
      var content = DOM.firstChild(parent);

      var c = new Content(lightDom, new NgElement(content));
      c.insert([createElement("<a></a>"), createElement("<b></b>")])

      expect(DOM.getInnerHTML(parent)).toEqual(`${_script}<a></a><b></b>${_script}`);
    });

    it("should remove the nodes from the previous insertion", () => {
      var lightDom = new DummyLightDom();
      var parent = createElement("<div><content></content></div>");
      var content = DOM.firstChild(parent);

      var c = new Content(lightDom, new NgElement(content));
      c.insert([createElement("<a></a>")]);
      c.insert([createElement("<b></b>")]);

      expect(DOM.getInnerHTML(parent)).toEqual(`${_script}<b></b>${_script}`);
    });

    it("should insert empty list", () => {
      var lightDom = new DummyLightDom();
      var parent = createElement("<div><content></content></div>");
      var content = DOM.firstChild(parent);

      var c = new Content(lightDom, new NgElement(content));
      c.insert([createElement("<a></a>")]);
      c.insert([]);

      expect(DOM.getInnerHTML(parent)).toEqual(`${_script}${_script}`);
    });
  });
}

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}
