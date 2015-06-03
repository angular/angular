import {
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  it,
} from 'angular2/test_lib';

import {stringify} from 'angular2/src/facade/lang';

import {MockTemplateResolver} from 'angular2/src/mock/template_resolver_mock';

import {Component, View} from 'angular2/angular2';

import {isBlank} from 'angular2/src/facade/lang';

import * as viewImpl from 'angular2/src/core/annotations_impl/view';

export function main() {
  describe('MockTemplateResolver', () => {
    var resolver;

    beforeEach(() => { resolver = new MockTemplateResolver(); });

    describe('View overriding', () => {
      it('should fallback to the default TemplateResolver when templates are not overridden',
         () => {
           var template = resolver.resolve(SomeComponent);
           expect(template.template).toEqual('template');
           expect(template.directives).toEqual([SomeDirective]);
         });

      it('should allow overriding the @View', () => {
        resolver.setView(SomeComponent, new viewImpl.View({template: 'overridden template'}));
        var template = resolver.resolve(SomeComponent);
        expect(template.template).toEqual('overridden template');
        expect(isBlank(template.directives)).toBe(true);

      });

      it('should not allow overriding a template after it has been resolved', () => {
        resolver.resolve(SomeComponent);
        expect(() => {
          resolver.setView(SomeComponent, new viewImpl.View({template: 'overridden template'}));
        })
            .toThrowError(
                `The component ${stringify(SomeComponent)} has already been compiled, its configuration can not be changed`);
      });
    });

    describe('inline template definition overriding', () => {
      it('should allow overriding the default template', () => {
        resolver.setInlineTemplate(SomeComponent, 'overridden template');
        var template = resolver.resolve(SomeComponent);
        expect(template.template).toEqual('overridden template');
        expect(template.directives).toEqual([SomeDirective]);
      });

      it('should allow overriding an overriden @View', () => {
        resolver.setView(SomeComponent, new viewImpl.View({template: 'overridden template'}));
        resolver.setInlineTemplate(SomeComponent, 'overridden template x 2');
        var template = resolver.resolve(SomeComponent);
        expect(template.template).toEqual('overridden template x 2');
      });

      it('should not allow overriding a template after it has been resolved', () => {
        resolver.resolve(SomeComponent);
        expect(() => { resolver.setInlineTemplate(SomeComponent, 'overridden template'); })
            .toThrowError(
                `The component ${stringify(SomeComponent)} has already been compiled, its configuration can not be changed`);
      });
    });


    describe('Directive overriding', () => {
      it('should allow overriding a directive from the default template', () => {
        resolver.overrideViewDirective(SomeComponent, SomeDirective, SomeOtherDirective);
        var template = resolver.resolve(SomeComponent);
        expect(template.directives.length).toEqual(1);
        expect(template.directives[0]).toBe(SomeOtherDirective);
      });

      it('should allow overriding a directive from an overriden @View', () => {
        resolver.setView(SomeComponent, new viewImpl.View({directives: [SomeOtherDirective]}));
        resolver.overrideViewDirective(SomeComponent, SomeOtherDirective, SomeComponent);
        var template = resolver.resolve(SomeComponent);
        expect(template.directives.length).toEqual(1);
        expect(template.directives[0]).toBe(SomeComponent);
      });

      it('should throw when the overridden directive is not present', () => {
        resolver.overrideViewDirective(SomeComponent, SomeOtherDirective, SomeDirective);
        expect(() => { resolver.resolve(SomeComponent); })
            .toThrowError(
                `Overriden directive ${stringify(SomeOtherDirective)} not found in the template of ${stringify(SomeComponent)}`);
      });

      it('should not allow overriding a directive after its template has been resolved', () => {
        resolver.resolve(SomeComponent);
        expect(() => {
          resolver.overrideViewDirective(SomeComponent, SomeDirective, SomeOtherDirective);
        })
            .toThrowError(
                `The component ${stringify(SomeComponent)} has already been compiled, its configuration can not be changed`);
      });
    });
  });
}

class SomeDirective {}

@Component({selector: 'cmp'})
@View({
  template: 'template',
  directives: [SomeDirective],
})
class SomeComponent {
}

class SomeOtherDirective {}
