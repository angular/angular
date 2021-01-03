/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {hasLifecycleHook as hasLifecycleHookImpl, LifecycleHooks as Hooks} from '@angular/compiler/src/lifecycle_reflector';
import {SimpleChanges} from '@angular/core';
import {JitReflector} from '@angular/platform-browser-dynamic/src/compiler_reflector';

function hasLifecycleHook(hook: Hooks, directive: any): boolean {
  return hasLifecycleHookImpl(new JitReflector(), hook, directive);
}

{
  describe('Create Directive', () => {
    describe('lifecycle', () => {
      describe('ngOnChanges', () => {
        it('should be true when the directive has the ngOnChanges method', () => {
          expect(hasLifecycleHook(Hooks.OnChanges, DirectiveWithOnChangesMethod)).toBe(true);
        });

        it('should be false otherwise', () => {
          expect(hasLifecycleHook(Hooks.OnChanges, DirectiveNoHooks)).toBe(false);
        });
      });

      describe('ngOnDestroy', () => {
        it('should be true when the directive has the ngOnDestroy method', () => {
          expect(hasLifecycleHook(Hooks.OnDestroy, DirectiveWithOnDestroyMethod)).toBe(true);
        });

        it('should be false otherwise', () => {
          expect(hasLifecycleHook(Hooks.OnDestroy, DirectiveNoHooks)).toBe(false);
        });
      });

      describe('ngOnInit', () => {
        it('should be true when the directive has the ngOnInit method', () => {
          expect(hasLifecycleHook(Hooks.OnInit, DirectiveWithOnInitMethod)).toBe(true);
        });

        it('should be false otherwise', () => {
          expect(hasLifecycleHook(Hooks.OnInit, DirectiveNoHooks)).toBe(false);
        });
      });

      describe('ngDoCheck', () => {
        it('should be true when the directive has the ngDoCheck method', () => {
          expect(hasLifecycleHook(Hooks.DoCheck, DirectiveWithOnCheckMethod)).toBe(true);
        });

        it('should be false otherwise', () => {
          expect(hasLifecycleHook(Hooks.DoCheck, DirectiveNoHooks)).toBe(false);
        });
      });

      describe('ngAfterContentInit', () => {
        it('should be true when the directive has the ngAfterContentInit method', () => {
          expect(hasLifecycleHook(Hooks.AfterContentInit, DirectiveWithAfterContentInitMethod))
              .toBe(true);
        });

        it('should be false otherwise', () => {
          expect(hasLifecycleHook(Hooks.AfterContentInit, DirectiveNoHooks)).toBe(false);
        });
      });

      describe('ngAfterContentChecked', () => {
        it('should be true when the directive has the ngAfterContentChecked method', () => {
          expect(
              hasLifecycleHook(Hooks.AfterContentChecked, DirectiveWithAfterContentCheckedMethod))
              .toBe(true);
        });

        it('should be false otherwise', () => {
          expect(hasLifecycleHook(Hooks.AfterContentChecked, DirectiveNoHooks)).toBe(false);
        });
      });


      describe('ngAfterViewInit', () => {
        it('should be true when the directive has the ngAfterViewInit method', () => {
          expect(hasLifecycleHook(Hooks.AfterViewInit, DirectiveWithAfterViewInitMethod))
              .toBe(true);
        });

        it('should be false otherwise', () => {
          expect(hasLifecycleHook(Hooks.AfterViewInit, DirectiveNoHooks)).toBe(false);
        });
      });

      describe('ngAfterViewChecked', () => {
        it('should be true when the directive has the ngAfterViewChecked method', () => {
          expect(hasLifecycleHook(Hooks.AfterViewChecked, DirectiveWithAfterViewCheckedMethod))
              .toBe(true);
        });

        it('should be false otherwise', () => {
          expect(hasLifecycleHook(Hooks.AfterViewChecked, DirectiveNoHooks)).toBe(false);
        });
      });
    });
  });
}

class DirectiveNoHooks {}

class DirectiveWithOnChangesMethod {
  ngOnChanges(_: SimpleChanges) {}
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
