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

import {DirectiveMetadata, LifecycleEvent} from 'angular2/src/core/metadata';
import {DirectiveBinding} from 'angular2/src/core/compiler/element_injector';

export function main() {
  describe('Create DirectiveMetadata', () => {
    describe('lifecycle', () => {
      function metadata(type, annotation) {
        return DirectiveBinding.createFromType(type, annotation).metadata;
      }

      describe("onChange", () => {
        it("should be true when the directive has the onChange method", () => {
          expect(metadata(DirectiveWithOnChangeMethod, new DirectiveMetadata({})).callOnChange)
              .toBe(true);
        });

        it("should be true when the lifecycle includes onChange", () => {
          expect(metadata(DirectiveNoHooks,
                          new DirectiveMetadata({lifecycle: [LifecycleEvent.onChange]}))
                     .callOnChange)
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(metadata(DirectiveNoHooks, new DirectiveMetadata()).callOnChange).toBe(false);
        });

        it("should be false when empty lifecycle", () => {
          expect(metadata(DirectiveWithOnChangeMethod, new DirectiveMetadata({lifecycle: []}))
                     .callOnChange)
              .toBe(false);
        });
      });

      describe("onDestroy", () => {
        it("should be true when the directive has the onDestroy method", () => {
          expect(metadata(DirectiveWithOnDestroyMethod, new DirectiveMetadata({})).callOnDestroy)
              .toBe(true);
        });

        it("should be true when the lifecycle includes onDestroy", () => {
          expect(metadata(DirectiveNoHooks,
                          new DirectiveMetadata({lifecycle: [LifecycleEvent.onDestroy]}))
                     .callOnDestroy)
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(metadata(DirectiveNoHooks, new DirectiveMetadata()).callOnDestroy).toBe(false);
        });
      });

      describe("onInit", () => {
        it("should be true when the directive has the onInit method", () => {
          expect(metadata(DirectiveWithOnInitMethod, new DirectiveMetadata({})).callOnInit)
              .toBe(true);
        });

        it("should be true when the lifecycle includes onDestroy", () => {
          expect(metadata(DirectiveNoHooks,
                          new DirectiveMetadata({lifecycle: [LifecycleEvent.onInit]}))
                     .callOnInit)
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(metadata(DirectiveNoHooks, new DirectiveMetadata()).callOnInit).toBe(false);
        });
      });

      describe("onCheck", () => {
        it("should be true when the directive has the onCheck method", () => {
          expect(metadata(DirectiveWithOnCheckMethod, new DirectiveMetadata({})).callOnCheck)
              .toBe(true);
        });

        it("should be true when the lifecycle includes onCheck", () => {
          expect(metadata(DirectiveNoHooks,
                          new DirectiveMetadata({lifecycle: [LifecycleEvent.onCheck]}))
                     .callOnCheck)
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(metadata(DirectiveNoHooks, new DirectiveMetadata()).callOnCheck).toBe(false);
        });
      });

      describe("onAllChangesDone", () => {
        it("should be true when the directive has the onAllChangesDone method", () => {
          expect(metadata(DirectiveWithOnAllChangesDoneMethod, new DirectiveMetadata({}))
                     .callOnAllChangesDone)
              .toBe(true);
        });

        it("should be true when the lifecycle includes onAllChangesDone", () => {
          expect(metadata(DirectiveNoHooks,
                          new DirectiveMetadata({lifecycle: [LifecycleEvent.onAllChangesDone]}))
                     .callOnAllChangesDone)
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(metadata(DirectiveNoHooks, new DirectiveMetadata()).callOnAllChangesDone)
              .toBe(false);
        });
      });
    });
  });
}

class DirectiveNoHooks {}

class DirectiveWithOnChangeMethod {
  onChange(_) {}
}

class DirectiveWithOnInitMethod {
  onInit() {}
}

class DirectiveWithOnCheckMethod {
  onCheck() {}
}

class DirectiveWithOnDestroyMethod {
  onDestroy(_) {}
}

class DirectiveWithOnAllChangesDoneMethod {
  onAllChangesDone() {}
}
