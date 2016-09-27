/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {hasLifecycleHook} from '@angular/compiler/src/lifecycle_reflector';
import {LifecycleHooks} from '@angular/core/src/metadata/lifecycle_hooks';
import {describe, expect, it} from '@angular/core/testing/testing_internal';

export function main() {
  describe('Create Directive', () => {
    describe('lifecycle', () => {

      describe('ngOnChanges', () => {
        it('should be true when the directive has the ngOnChanges method', () => {
          expect(hasLifecycleHook(LifecycleHooks.OnChanges, DirectiveWithOnChangesMethod))
              .toBe(true);
        });

        it('should be false otherwise', () => {
          expect(hasLifecycleHook(LifecycleHooks.OnChanges, DirectiveNoHooks)).toBe(false);
        });
      });

      describe('ngOnDestroy', () => {
        it('should be true when the directive has the ngOnDestroy method', () => {
          expect(hasLifecycleHook(LifecycleHooks.OnDestroy, DirectiveWithOnDestroyMethod))
              .toBe(true);
        });

        it('should be false otherwise', () => {
          expect(hasLifecycleHook(LifecycleHooks.OnDestroy, DirectiveNoHooks)).toBe(false);
        });
      });

      describe('ngOnInit', () => {
        it('should be true when the directive has the ngOnInit method', () => {
          expect(hasLifecycleHook(LifecycleHooks.OnInit, DirectiveWithOnInitMethod)).toBe(true);
        });

        it('should be false otherwise', () => {
          expect(hasLifecycleHook(LifecycleHooks.OnInit, DirectiveNoHooks)).toBe(false);
        });
      });

      describe('ngDoCheck', () => {
        it('should be true when the directive has the ngDoCheck method', () => {
          expect(hasLifecycleHook(LifecycleHooks.DoCheck, DirectiveWithOnCheckMethod)).toBe(true);
        });

        it('should be false otherwise', () => {
          expect(hasLifecycleHook(LifecycleHooks.DoCheck, DirectiveNoHooks)).toBe(false);
        });
      });

      describe('ngAfterContentInit', () => {
        it('should be true when the directive has the ngAfterContentInit method', () => {
          expect(hasLifecycleHook(
                     LifecycleHooks.AfterContentInit, DirectiveWithAfterContentInitMethod))
              .toBe(true);
        });

        it('should be false otherwise', () => {
          expect(hasLifecycleHook(LifecycleHooks.AfterContentInit, DirectiveNoHooks)).toBe(false);
        });
      });

      describe('ngAfterContentChecked', () => {
        it('should be true when the directive has the ngAfterContentChecked method', () => {
          expect(hasLifecycleHook(
                     LifecycleHooks.AfterContentChecked, DirectiveWithAfterContentCheckedMethod))
              .toBe(true);
        });

        it('should be false otherwise', () => {
          expect(hasLifecycleHook(LifecycleHooks.AfterContentChecked, DirectiveNoHooks))
              .toBe(false);
        });
      });


      describe('ngAfterViewInit', () => {
        it('should be true when the directive has the ngAfterViewInit method', () => {
          expect(hasLifecycleHook(LifecycleHooks.AfterViewInit, DirectiveWithAfterViewInitMethod))
              .toBe(true);
        });

        it('should be false otherwise', () => {
          expect(hasLifecycleHook(LifecycleHooks.AfterViewInit, DirectiveNoHooks)).toBe(false);
        });
      });

      describe('ngAfterViewChecked', () => {
        it('should be true when the directive has the ngAfterViewChecked method', () => {
          expect(hasLifecycleHook(
                     LifecycleHooks.AfterViewChecked, DirectiveWithAfterViewCheckedMethod))
              .toBe(true);
        });

        it('should be false otherwise', () => {
          expect(hasLifecycleHook(LifecycleHooks.AfterViewChecked, DirectiveNoHooks)).toBe(false);
        });
      });
    });
  });
}

class DirectiveNoHooks {}

class DirectiveWithOnChangesMethod {
  ngOnChanges(_: any /** TODO #9100 */) {}
}

class DirectiveWithOnInitMethod {
  ngOnInit() {}
}

class DirectiveWithOnCheckMethod {
  ngDoCheck() {}
}

class DirectiveWithOnDestroyMethod {
  ngOnDestroy() {}
}

class DirectiveWithAfterContentInitMethod {
  ngAfterContentInit() {}
}

class DirectiveWithAfterContentCheckedMethod {
  ngAfterContentChecked() {}
}

class DirectiveWithAfterViewInitMethod {
  ngAfterViewInit() {}
}

class DirectiveWithAfterViewCheckedMethod {
  ngAfterViewChecked() {}
}
