import {
  ddescribe,
  describe,
  it,
  inject,
  iit,
  xit,
  expect,
  afterEach
} from 'angular2/testing_internal';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';
import {Title} from 'angular2/platform/tokens';

export function main() {
  describe('title service', () => {
    var initialTitle = DOM.getTitle();

    afterEach(() => { DOM.setTitle(initialTitle); });

    it('should allow reading initial title', inject([Title], (titleService) => {
         expect(titleService.getTitle()).toEqual(initialTitle);
       }));

    it('should set a title on the injected document', inject([Title], (titleService) => {
         titleService.setTitle('test title');
         expect(DOM.getTitle()).toEqual('test title');
         expect(titleService.getTitle()).toEqual('test title');
       }));

    it('should reset title to empty string if title not provided',
       inject([Title], (titleService) => {
         titleService.setTitle(null);
         expect(DOM.getTitle()).toEqual('');
       }));

  });
}
