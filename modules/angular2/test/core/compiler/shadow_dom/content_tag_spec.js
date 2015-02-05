import {describe, beforeEach, it, expect, ddescribe, iit, SpyObject, el} from 'angular2/test_lib';
import {proxy, IMPLEMENTS} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/facade/dom';
import {Content} from 'angular2/src/core/compiler/shadow_dom_emulation/content_tag';
import {NgElement} from 'angular2/src/core/dom/element';
import {LightDom} from 'angular2/src/core/compiler/shadow_dom_emulation/light_dom';

@proxy
@IMPLEMENTS(LightDom)
class DummyLightDom extends SpyObject {noSuchMethod(m){super.noSuchMethod(m)}}

var _script = `<script type="ng/content"></script>`;

export function main() {
  describe('Content', function() {
    it("should insert the nodes", () => {
      var parent = el("<div><content></content></div>");
      var content = DOM.firstChild(parent);

      var c = new Content(null, new NgElement(content));
      c.insert([el("<a></a>"), el("<b></b>")])

      expect(DOM.getInnerHTML(parent)).toEqual(`${_script}<a></a><b></b>${_script}`);
    });

    it("should remove the nodes from the previous insertion", () => {
      var parent = el("<div><content></content></div>");
      var content = DOM.firstChild(parent);

      var c = new Content(null, new NgElement(content));
      c.insert([el("<a></a>")]);
      c.insert([el("<b></b>")]);

      expect(DOM.getInnerHTML(parent)).toEqual(`${_script}<b></b>${_script}`);
    });

    it("should insert empty list", () => {
      var parent = el("<div><content></content></div>");
      var content = DOM.firstChild(parent);

      var c = new Content(null, new NgElement(content));
      c.insert([el("<a></a>")]);
      c.insert([]);

      expect(DOM.getInnerHTML(parent)).toEqual(`${_script}${_script}`);
    });
  });
}