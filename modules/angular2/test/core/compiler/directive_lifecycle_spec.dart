library angular2.test.core.compiler.directive_lifecycle_spec;

import 'package:angular2/test_lib.dart';
import 'package:angular2/angular2.dart';
import 'package:angular2/src/core/compiler/element_injector.dart';

main() {
  describe('Create DirectiveMetadata', () {
    describe('lifecycle', () {
      metadata(type, annotation) =>
          DirectiveBinding.createFromType(type, annotation).metadata;

      describe("onChange", () {
        it("should be true when the directive implements OnChange", () {
          expect(metadata(
                  DirectiveImplementingOnChange, new Directive()).callOnChange)
              .toBe(true);
        });

        it("should be true when the lifecycle includes onChange", () {
          expect(metadata(DirectiveNoHooks,
              new Directive(lifecycle: [onChange])).callOnChange).toBe(true);
        });

        it("should be false otherwise", () {
          expect(metadata(DirectiveNoHooks, new Directive()).callOnChange)
              .toBe(false);
        });

        it("should be false when empty lifecycle", () {
          expect(metadata(DirectiveImplementingOnChange,
              new Directive(lifecycle: [])).callOnChange).toBe(false);
        });
      });

      describe("onDestroy", () {
        it("should be true when the directive implements OnDestroy", () {
          expect(metadata(DirectiveImplementingOnDestroy,
              new Directive()).callOnDestroy).toBe(true);
        });

        it("should be true when the lifecycle includes onDestroy", () {
          expect(metadata(DirectiveNoHooks,
              new Directive(lifecycle: [onDestroy])).callOnDestroy).toBe(true);
        });

        it("should be false otherwise", () {
          expect(metadata(DirectiveNoHooks, new Directive()).callOnDestroy)
              .toBe(false);
        });
      });

      describe("onCheck", () {
        it("should be true when the directive implements OnCheck", () {
          expect(metadata(
                  DirectiveImplementingOnCheck, new Directive()).callOnCheck)
              .toBe(true);
        });

        it("should be true when the lifecycle includes onCheck", () {
          expect(metadata(DirectiveNoHooks,
              new Directive(lifecycle: [onCheck])).callOnCheck).toBe(true);
        });

        it("should be false otherwise", () {
          expect(metadata(DirectiveNoHooks, new Directive()).callOnCheck)
              .toBe(false);
        });
      });

      describe("onInit", () {
        it("should be true when the directive implements OnInit", () {
          expect(metadata(
                  DirectiveImplementingOnInit, new Directive()).callOnInit)
              .toBe(true);
        });

        it("should be true when the lifecycle includes onInit", () {
          expect(metadata(DirectiveNoHooks,
              new Directive(lifecycle: [onInit])).callOnInit).toBe(true);
        });

        it("should be false otherwise", () {
          expect(metadata(DirectiveNoHooks, new Directive()).callOnInit)
              .toBe(false);
        });
      });

      describe("onAllChangesDone", () {
        it("should be true when the directive implements OnAllChangesDone", () {
          expect(metadata(DirectiveImplementingOnAllChangesDone,
              new Directive()).callOnAllChangesDone).toBe(true);
        });

        it("should be true when the lifecycle includes onAllChangesDone", () {
          expect(metadata(DirectiveNoHooks, new Directive(
              lifecycle: [onAllChangesDone])).callOnAllChangesDone).toBe(true);
        });

        it("should be false otherwise", () {
          expect(metadata(
                  DirectiveNoHooks, new Directive()).callOnAllChangesDone)
              .toBe(false);
        });
      });
    });
  });
}

class DirectiveNoHooks {}

class DirectiveImplementingOnChange implements OnChange {
  onChange(_) {}
}

class DirectiveImplementingOnCheck implements OnCheck {
  onCheck() {}
}

class DirectiveImplementingOnInit implements OnInit {
  onInit() {}
}

class DirectiveImplementingOnDestroy implements OnDestroy {
  onDestroy() {}
}

class DirectiveImplementingOnAllChangesDone implements OnAllChangesDone {
  onAllChangesDone() {}
}
