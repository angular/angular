/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, Injector} from '@angular/core';
import {inject, TestBed} from '@angular/core/testing';
import {JitReflector} from '@angular/platform-browser-dynamic/src/compiler_reflector';

import {MockDirectiveResolver} from '../testing';

{
  describe('MockDirectiveResolver', () => {
    let dirResolver: MockDirectiveResolver;

    beforeEach(() => {
      TestBed.configureTestingModule(
          {declarations: [SomeDirective, SomeOtherDirective, SomeComponent]});
    });

    beforeEach(inject([Injector], (injector: Injector) => {
      dirResolver = new MockDirectiveResolver(new JitReflector());
    }));

    describe('Directive overriding', () => {
      it('should fallback to the default DirectiveResolver when templates are not overridden',
         () => {
           const ngModule = dirResolver.resolve(SomeComponent);
           expect(ngModule.selector).toEqual('cmp');
         });

      it('should allow overriding the @Directive', () => {
        dirResolver.setDirective(SomeComponent, new Component({selector: 'someOtherSelector'}));
        const metadata = dirResolver.resolve(SomeComponent);
        expect(metadata.selector).toEqual('someOtherSelector');
      });
    });
  });
}

@Directive({selector: 'some-directive'})
class SomeDirective {
}

@Component({selector: 'cmp', template: 'template'})
class SomeComponent {
}

@Directive({selector: 'some-other-directive'})
class SomeOtherDirective {
}
