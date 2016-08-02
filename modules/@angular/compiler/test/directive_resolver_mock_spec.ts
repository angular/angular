/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ComponentMetadata, Injector, ViewMetadata} from '@angular/core';
import {beforeEach, ddescribe, describe, expect, iit, inject, it} from '@angular/core/testing/testing_internal';

import {isBlank, stringify} from '../src/facade/lang';
import {MockDirectiveResolver} from '../testing';

export function main() {
  describe('MockDirectiveResolver', () => {
    var dirResolver: MockDirectiveResolver;

    beforeEach(inject([Injector], (injector: Injector) => {
      dirResolver = new MockDirectiveResolver(injector);
    }));

    describe('Directive overriding', () => {
      it('should fallback to the default DirectiveResolver when templates are not overridden',
         () => {
           var ngModule = dirResolver.resolve(SomeComponent);
           expect(ngModule.selector).toEqual('cmp');
         });

      it('should allow overriding the @Directive', () => {
        dirResolver.setDirective(
            SomeComponent, new ComponentMetadata({selector: 'someOtherSelector'}));
        var metadata = dirResolver.resolve(SomeComponent);
        expect(metadata.selector).toEqual('someOtherSelector');
      });
    });

    describe('View overriding', () => {
      it('should fallback to the default ViewResolver when templates are not overridden', () => {
        var view = <ComponentMetadata>dirResolver.resolve(SomeComponent);
        expect(view.template).toEqual('template');
        expect(view.directives).toEqual([SomeDirective]);
      });

      it('should allow overriding the @View', () => {
        dirResolver.setView(SomeComponent, new ViewMetadata({template: 'overridden template'}));
        var view = <ComponentMetadata>dirResolver.resolve(SomeComponent);
        expect(view.template).toEqual('overridden template');
        expect(isBlank(view.directives)).toBe(true);
      });

      it('should allow overriding a view after it has been resolved', () => {
        dirResolver.resolve(SomeComponent);
        dirResolver.setView(SomeComponent, new ViewMetadata({template: 'overridden template'}));
        var view = <ComponentMetadata>dirResolver.resolve(SomeComponent);
        expect(view.template).toEqual('overridden template');
        expect(isBlank(view.directives)).toBe(true);
      });
    });

    describe('inline template definition overriding', () => {
      it('should allow overriding the default template', () => {
        dirResolver.setInlineTemplate(SomeComponent, 'overridden template');
        var view = <ComponentMetadata>dirResolver.resolve(SomeComponent);
        expect(view.template).toEqual('overridden template');
        expect(view.directives).toEqual([SomeDirective]);
      });

      it('should allow overriding an overridden @View', () => {
        dirResolver.setView(SomeComponent, new ViewMetadata({template: 'overridden template'}));
        dirResolver.setInlineTemplate(SomeComponent, 'overridden template x 2');
        var view = <ComponentMetadata>dirResolver.resolve(SomeComponent);
        expect(view.template).toEqual('overridden template x 2');
      });

      it('should allow overriding a view after it has been resolved', () => {
        dirResolver.resolve(SomeComponent);
        dirResolver.setInlineTemplate(SomeComponent, 'overridden template');
        var view = <ComponentMetadata>dirResolver.resolve(SomeComponent);
        expect(view.template).toEqual('overridden template');
      });
    });


    describe('Directive overriding', () => {
      it('should allow overriding a directive from the default view', () => {
        dirResolver.overrideViewDirective(SomeComponent, SomeDirective, SomeOtherDirective);
        var view = <ComponentMetadata>dirResolver.resolve(SomeComponent);
        expect(view.directives.length).toEqual(1);
        expect(view.directives[0]).toBe(SomeOtherDirective);
      });

      it('should allow overriding a directive from an overridden @View', () => {
        dirResolver.setView(SomeComponent, new ViewMetadata({directives: [SomeOtherDirective]}));
        dirResolver.overrideViewDirective(SomeComponent, SomeOtherDirective, SomeComponent);
        var view = <ComponentMetadata>dirResolver.resolve(SomeComponent);
        expect(view.directives.length).toEqual(1);
        expect(view.directives[0]).toBe(SomeComponent);
      });

      it('should throw when the overridden directive is not present', () => {
        dirResolver.overrideViewDirective(SomeComponent, SomeOtherDirective, SomeDirective);
        expect(() => { dirResolver.resolve(SomeComponent); })
            .toThrowError(
                `Overriden directive ${stringify(SomeOtherDirective)} not found in the template of ${stringify(SomeComponent)}`);
      });

      it('should allow overriding a directive after its view has been resolved', () => {
        dirResolver.resolve(SomeComponent);
        dirResolver.overrideViewDirective(SomeComponent, SomeDirective, SomeOtherDirective);
        var view = <ComponentMetadata>dirResolver.resolve(SomeComponent);
        expect(view.directives.length).toEqual(1);
        expect(view.directives[0]).toBe(SomeOtherDirective);
      });
    });
  });
}

class SomeDirective {}

@Component({
  selector: 'cmp',
  template: 'template',
  directives: [SomeDirective],
})
class SomeComponent {
}

class SomeOtherDirective {}
