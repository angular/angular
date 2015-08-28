library angular2.test.core.compiler.directive_lifecycle_spec;

import 'package:angular2/test_lib.dart';
import 'package:angular2/angular2.dart';
import 'package:angular2/src/core/compiler/element_injector.dart';

main() {
  describe('Create DirectiveMetadata', () {
    describe('lifecycle', () {
      metadata(type, annotation) =>
          DirectiveBinding.createFromType(type, annotation).metadata;

      describe("onChanges", () {
        it("should be true when the directive implements OnChanges", () {
          expect(metadata(DirectiveImplementingOnChanges, new Directive())
              .callOnChanges).toBe(true);
        });

        it("should be true when the lifecycle includes onChanges", () {
          expect(metadata(DirectiveNoHooks,
                  new Directive(lifecycle: [LifecycleEvent.OnChanges]))
              .callOnChanges).toBe(true);
        });

        it("should be false otherwise", () {
          expect(metadata(DirectiveNoHooks, new Directive()).callOnChanges)
              .toBe(false);
        });

        it("should be false when empty lifecycle", () {
          expect(metadata(
                  DirectiveImplementingOnChanges, new Directive(lifecycle: []))
              .callOnChanges).toBe(false);
        });
      });

      describe("onDestroy", () {
        it("should be true when the directive implements OnDestroy", () {
          expect(metadata(DirectiveImplementingOnDestroy, new Directive())
              .callOnDestroy).toBe(true);
        });

        it("should be true when the lifecycle includes onDestroy", () {
          expect(metadata(DirectiveNoHooks,
                  new Directive(lifecycle: [LifecycleEvent.OnDestroy]))
              .callOnDestroy).toBe(true);
        });

        it("should be false otherwise", () {
          expect(metadata(DirectiveNoHooks, new Directive()).callOnDestroy)
              .toBe(false);
        });
      });

      describe("doCheck", () {
        it("should be true when the directive implements DoCheck", () {
          expect(metadata(DirectiveImplementingOnCheck, new Directive())
              .callDoCheck).toBe(true);
        });

        it("should be true when the lifecycle includes doCheck", () {
          expect(metadata(DirectiveNoHooks,
                  new Directive(lifecycle: [LifecycleEvent.DoCheck]))
              .callDoCheck).toBe(true);
        });

        it("should be false otherwise", () {
          expect(metadata(DirectiveNoHooks, new Directive()).callDoCheck)
              .toBe(false);
        });
      });

      describe("onInit", () {
        it("should be true when the directive implements OnInit", () {
          expect(metadata(DirectiveImplementingOnInit, new Directive())
              .callOnInit).toBe(true);
        });

        it("should be true when the lifecycle includes onInit", () {
          expect(metadata(DirectiveNoHooks,
                  new Directive(lifecycle: [LifecycleEvent.OnInit])).callOnInit)
              .toBe(true);
        });

        it("should be false otherwise", () {
          expect(metadata(DirectiveNoHooks, new Directive()).callOnInit)
              .toBe(false);
        });
      });

      describe("afterContentChecked", () {
        it("should be true when the directive implements AfterContentChecked", () {
          expect(
              metadata(DirectiveImplementingAfterContentChecked, new Directive())
                  .callAfterContentChecked).toBe(true);
        });

        it("should be true when the lifecycle includes afterContentChecked", () {
          expect(metadata(DirectiveNoHooks,
                  new Directive(lifecycle: [LifecycleEvent.AfterContentChecked]))
              .callAfterContentChecked).toBe(true);
        });

        it("should be false otherwise", () {
          expect(metadata(DirectiveNoHooks, new Directive())
              .callAfterContentChecked).toBe(false);
        });
      });
    });
  });
}

class DirectiveNoHooks {}

class DirectiveImplementingOnChanges implements OnChanges {
  onChanges(_) {}
}

class DirectiveImplementingOnCheck implements DoCheck {
  doCheck() {}
}

class DirectiveImplementingOnInit implements OnInit {
  onInit() {}
}

class DirectiveImplementingOnDestroy implements OnDestroy {
  onDestroy() {}
}

class DirectiveImplementingAfterContentChecked implements AfterContentChecked {
  afterContentChecked() {}
}
