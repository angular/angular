import {ddescribe, describe, it, iit, xit, expect, afterEach} from 'angular2/testing_internal';
import {DOM} from 'angular2/src/core/dom/dom_adapter';

import {Title} from 'angular2/src/core/services/title';

export function main() {
  describe('title service', () => {
    var initialTitle = DOM.getTitle();
    var titleService = new Title();

    afterEach(() => { DOM.setTitle(initialTitle); });

    it('should allow reading initial title',
       () => { expect(titleService.getTitle()).toEqual(initialTitle); });

    it('should set a title on the injected document', () => {
      titleService.setTitle('test title');
      expect(DOM.getTitle()).toEqual('test title');
      expect(titleService.getTitle()).toEqual('test title');
    });

    it('should reset title to empty string if title not provided', () => {
      titleService.setTitle(null);
      expect(DOM.getTitle()).toEqual('');
    });

  });
}
