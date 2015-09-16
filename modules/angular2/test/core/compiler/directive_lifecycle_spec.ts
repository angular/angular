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

import {DirectiveMetadata} from 'angular2/src/core/metadata';
import {DirectiveBinding} from 'angular2/src/core/compiler/element_injector';
import {RenderDirectiveMetadata} from 'angular2/src/core/render/api';

export function main() {
  describe('Create DirectiveMetadata', () => {
    describe('lifecycle', () => {
      function metadata(type, annotation): RenderDirectiveMetadata {
        return DirectiveBinding.createFromType(type, annotation).metadata;
      }

      describe("onChanges", () => {
        it("should be true when the directive has the onChanges method", () => {
          expect(metadata(DirectiveWithOnChangesMethod, new DirectiveMetadata({})).callOnChanges)
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(metadata(DirectiveNoHooks, new DirectiveMetadata()).callOnChanges).toBe(false);
        });
      });

      describe("onDestroy", () => {
        it("should be true when the directive has the onDestroy method", () => {
          expect(metadata(DirectiveWithOnDestroyMethod, new DirectiveMetadata({})).callOnDestroy)
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

        it("should be false otherwise", () => {
          expect(metadata(DirectiveNoHooks, new DirectiveMetadata()).callOnInit).toBe(false);
        });
      });

      describe("doCheck", () => {
        it("should be true when the directive has the doCheck method", () => {
          expect(metadata(DirectiveWithOnCheckMethod, new DirectiveMetadata({})).callDoCheck)
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(metadata(DirectiveNoHooks, new DirectiveMetadata()).callDoCheck).toBe(false);
        });
      });

      describe("afterContentInit", () => {
        it("should be true when the directive has the afterContentInit method", () => {
          expect(metadata(DirectiveWithAfterContentInitMethod, new DirectiveMetadata({}))
                     .callAfterContentInit)
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(metadata(DirectiveNoHooks, new DirectiveMetadata()).callAfterContentInit)
              .toBe(false);
        });
      });

      describe("afterContentChecked", () => {
        it("should be true when the directive has the afterContentChecked method", () => {
          expect(metadata(DirectiveWithAfterContentCheckedMethod, new DirectiveMetadata({}))
                     .callAfterContentChecked)
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(metadata(DirectiveNoHooks, new DirectiveMetadata()).callAfterContentChecked)
              .toBe(false);
        });
      });


      describe("afterViewInit", () => {
        it("should be true when the directive has the afterViewInit method", () => {
          expect(metadata(DirectiveWithAfterViewInitMethod, new DirectiveMetadata({}))
                     .callAfterViewInit)
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(metadata(DirectiveNoHooks, new DirectiveMetadata()).callAfterViewInit).toBe(false);
        });
      });

      describe("afterViewChecked", () => {
        it("should be true when the directive has the afterViewChecked method", () => {
          expect(metadata(DirectiveWithAfterViewCheckedMethod, new DirectiveMetadata({}))
                     .callAfterViewChecked)
              .toBe(true);
        });

        it("should be false otherwise", () => {
          expect(metadata(DirectiveNoHooks, new DirectiveMetadata()).callAfterViewChecked)
              .toBe(false);
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
