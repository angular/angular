import {
  AsyncTestCompleter,
  beforeEach,
  xdescribe,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  SpyObject,
  proxy
} from 'angular2/test_lib';

import {hasLifecycleHook} from 'angular2/src/core/compiler/directive_lifecycle_reflector';
import {LifecycleHooks} from 'angular2/src/core/compiler/interfaces';

export function main() {
  describe('Create DirectiveMetadata', () => {
    describe('lifecycle', () => {

      describe("onChanges", () => {
        it("should be true when the directive has the onChanges method", () => {
          expect(hasLifecycleHook(LifecycleHooks.OnChanges, DirectiveWithOnChangesMethod))
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(hasLifecycleHook(LifecycleHooks.OnChanges, DirectiveNoHooks)).toBe(false);
        });
      });

      describe("onDestroy", () => {
        it("should be true when the directive has the onDestroy method", () => {
          expect(hasLifecycleHook(LifecycleHooks.OnDestroy, DirectiveWithOnDestroyMethod))
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(hasLifecycleHook(LifecycleHooks.OnDestroy, DirectiveNoHooks)).toBe(false);
        });
      });

      describe("onInit", () => {
        it("should be true when the directive has the onInit method", () => {
          expect(hasLifecycleHook(LifecycleHooks.OnInit, DirectiveWithOnInitMethod)).toBe(true);
        });

        it("should be false otherwise", () => {
          expect(hasLifecycleHook(LifecycleHooks.OnInit, DirectiveNoHooks)).toBe(false);
        });
      });

      describe("doCheck", () => {
        it("should be true when the directive has the doCheck method", () => {
          expect(hasLifecycleHook(LifecycleHooks.DoCheck, DirectiveWithOnCheckMethod)).toBe(true);
        });

        it("should be false otherwise", () => {
          expect(hasLifecycleHook(LifecycleHooks.DoCheck, DirectiveNoHooks)).toBe(false);
        });
      });

      describe("afterContentInit", () => {
        it("should be true when the directive has the afterContentInit method", () => {
          expect(hasLifecycleHook(LifecycleHooks.AfterContentInit,
                                  DirectiveWithAfterContentInitMethod))
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(hasLifecycleHook(LifecycleHooks.AfterContentInit, DirectiveNoHooks)).toBe(false);
        });
      });

      describe("afterContentChecked", () => {
        it("should be true when the directive has the afterContentChecked method", () => {
          expect(hasLifecycleHook(LifecycleHooks.AfterContentChecked,
                                  DirectiveWithAfterContentCheckedMethod))
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(hasLifecycleHook(LifecycleHooks.AfterContentChecked, DirectiveNoHooks))
              .toBe(false);
        });
      });


      describe("afterViewInit", () => {
        it("should be true when the directive has the afterViewInit method", () => {
          expect(hasLifecycleHook(LifecycleHooks.AfterViewInit, DirectiveWithAfterViewInitMethod))
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(hasLifecycleHook(LifecycleHooks.AfterViewInit, DirectiveNoHooks)).toBe(false);
        });
      });

      describe("afterViewChecked", () => {
        it("should be true when the directive has the afterViewChecked method", () => {
          expect(hasLifecycleHook(LifecycleHooks.AfterViewChecked,
                                  DirectiveWithAfterViewCheckedMethod))
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(hasLifecycleHook(LifecycleHooks.AfterViewChecked, DirectiveNoHooks)).toBe(false);
        });
      });
    });
  });
}

class DirectiveNoHooks {}

class DirectiveWithOnChangesMethod {
  onChanges(_) {}
}

class DirectiveWithOnInitMethod {
  onInit() {}
}

class DirectiveWithOnCheckMethod {
  doCheck() {}
}

class DirectiveWithOnDestroyMethod {
  onDestroy() {}
}

class DirectiveWithAfterContentInitMethod {
  afterContentInit() {}
}

class DirectiveWithAfterContentCheckedMethod {
  afterContentChecked() {}
}

class DirectiveWithAfterViewInitMethod {
  afterViewInit() {}
}

class DirectiveWithAfterViewCheckedMethod {
  afterViewChecked() {}
}
