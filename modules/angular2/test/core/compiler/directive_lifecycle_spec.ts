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
  IS_DARTIUM,
  it,
  SpyObject,
  proxy
} from 'angular2/test_lib';

import {
  Directive,
  onChange,
  onDestroy,
  onCheck,
  onInit,
  onAllChangesDone
} from 'angular2/src/core/annotations_impl/annotations';
import {DirectiveBinding} from 'angular2/src/core/compiler/element_injector';

export function main() {
  describe('Create DirectiveMetadata', () => {
    describe('lifecycle', () => {
      function metadata(type, annotation) {
        return DirectiveBinding.createFromType(type, annotation).metadata;
      }

      describe("onChange", () => {
        it("should be true when the directive has the onChange method", () => {
          expect(metadata(DirectiveWithOnChangeMethod, new Directive({})).callOnChange).toBe(true);
        });

        it("should be true when the lifecycle includes onChange", () => {
          expect(metadata(DirectiveNoHooks, new Directive({lifecycle: [onChange]})).callOnChange)
              .toBe(true);
        });

        it("should be false otherwise",
           () => { expect(metadata(DirectiveNoHooks, new Directive()).callOnChange).toBe(false); });

        it("should be false when empty lifecycle", () => {
          expect(metadata(DirectiveWithOnChangeMethod, new Directive({lifecycle: []})).callOnChange)
              .toBe(false);
        });
      });

      describe("onDestroy", () => {
        it("should be true when the directive has the onDestroy method", () => {
          expect(metadata(DirectiveWithOnDestroyMethod, new Directive({})).callOnDestroy)
              .toBe(true);
        });

        it("should be true when the lifecycle includes onDestroy", () => {
          expect(metadata(DirectiveNoHooks, new Directive({lifecycle: [onDestroy]})).callOnDestroy)
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(metadata(DirectiveNoHooks, new Directive()).callOnDestroy).toBe(false);
        });
      });

      describe("onInit", () => {
        it("should be true when the directive has the onInit method", () => {
          expect(metadata(DirectiveWithOnInitMethod, new Directive({})).callOnInit).toBe(true);
        });

        it("should be true when the lifecycle includes onDestroy", () => {
          expect(metadata(DirectiveNoHooks, new Directive({lifecycle: [onInit]})).callOnInit)
              .toBe(true);
        });

        it("should be false otherwise",
           () => { expect(metadata(DirectiveNoHooks, new Directive()).callOnInit).toBe(false); });
      });

      describe("onCheck", () => {
        it("should be true when the directive has the onCheck method", () => {
          expect(metadata(DirectiveWithOnCheckMethod, new Directive({})).callOnCheck).toBe(true);
        });

        it("should be true when the lifecycle includes onCheck", () => {
          expect(metadata(DirectiveNoHooks, new Directive({lifecycle: [onCheck]})).callOnCheck)
              .toBe(true);
        });

        it("should be false otherwise",
           () => { expect(metadata(DirectiveNoHooks, new Directive()).callOnCheck).toBe(false); });
      });

      describe("onAllChangesDone", () => {
        it("should be true when the directive has the onAllChangesDone method", () => {
          expect(
              metadata(DirectiveWithOnAllChangesDoneMethod, new Directive({})).callOnAllChangesDone)
              .toBe(true);
        });

        it("should be true when the lifecycle includes onAllChangesDone", () => {
          expect(metadata(DirectiveNoHooks, new Directive({lifecycle: [onAllChangesDone]}))
                     .callOnAllChangesDone)
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(metadata(DirectiveNoHooks, new Directive()).callOnAllChangesDone).toBe(false);
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