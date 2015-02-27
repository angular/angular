import {ddescribe, describe, it, iit, xit, expect, afterEach} from 'angular2/test_lib';
import {DOM} from 'angular2/src/facade/dom';

import {TitleService} from 'angular2/src/services/title';

export function main() {

  describe('title service', () => {
    var initialTitle = DOM.getTitle(DOM.defaultDoc());
    var titleService = new TitleService(DOM.defaultDoc());

    afterEach(() => {
      DOM.setTitle(DOM.defaultDoc(), initialTitle);
    });

    it('should set a title on the injected document', () => {
      titleService.setTitle('test title');
      expect(DOM.getTitle(DOM.defaultDoc())).toEqual('test title');
    });

    it('should reset title to empty string if title not provided', () => {
      titleService.setTitle(null);
      expect(DOM.getTitle(DOM.defaultDoc())).toEqual('');
    });
  });
}
