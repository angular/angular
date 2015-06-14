import {
  describe,
  beforeEach,
  it,
  expect,
  ddescribe,
  iit,
  SpyObject,
  el,
  proxy
} from 'angular2/test_lib';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Content} from 'angular2/src/render/dom/shadow_dom/content_tag';

var _scriptStart = `<script start=""></script>`;

export function main() {
  describe('Content', function() {
    var parent;
    var content;

    beforeEach(() => {
      parent = el(`<div>${_scriptStart}</div>`);
      let contentStartMarker = DOM.firstChild(parent);
      content = new Content(contentStartMarker, '');
    });

    it("should insert the nodes", () => {
      content.init(null);
      content.insert([el("<a>A</a>"), el("<b>B</b>")]);

      expect(parent).toHaveText('AB');
    });

    it("should remove the nodes from the previous insertion", () => {
      content.init(null);
      content.insert([el("<a>A</a>")]);
      content.insert([el("<b>B</b>")]);

      expect(parent).toHaveText('B');
    });

    it("should clear nodes on inserting an empty list", () => {
      content.init(null);
      content.insert([el("<a>A</a>")]);
      content.insert([]);

      expect(parent).toHaveText('');
    });
  });
}
