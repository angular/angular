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

        it("should be false otherwise", () {
          expect(metadata(DirectiveNoHooks, new Directive()).callOnChanges)
              .toBe(false);
        });
      });

      describe("onDestroy", () {
        it("should be true when the directive implements OnDestroy", () {
          expect(metadata(DirectiveImplementingOnDestroy, new Directive())
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

        it("should be false otherwise", () {
          expect(metadata(DirectiveNoHooks, new Directive()).callOnInit)
              .toBe(false);
        });
      });

      describe("afterContentInit", () {
        it("should be true when the directive implements AfterContentInit", () {
          expect(
              metadata(DirectiveImplementingAfterContentInit, new Directive())
                  .callAfterContentInit).toBe(true);
        });

        it("should be false otherwise", () {
          expect(metadata(DirectiveNoHooks, new Directive())
              .callAfterContentInit).toBe(false);
        });
      });

      describe("afterContentChecked", () {
        it("should be true when the directive implements AfterContentChecked", () {
          expect(
              metadata(DirectiveImplementingAfterContentChecked, new Directive())
                  .callAfterContentChecked).toBe(true);
        });

        it("should be false otherwise", () {
          expect(metadata(DirectiveNoHooks, new Directive())
              .callAfterContentChecked).toBe(false);
        });
      });

      describe("afterViewInit", () {
        it("should be true when the directive implements AfterViewInit", () {
          expect(
              metadata(DirectiveImplementingAfterViewInit, new Directive())
                  .callAfterViewInit).toBe(true);
        });

        it("should be false otherwise", () {
          expect(metadata(DirectiveNoHooks, new Directive())
              .callAfterViewInit).toBe(false);
        });
      });

      describe("afterViewChecked", () {
        it("should be true when the directive implements AfterViewChecked", () {
          expect(
              metadata(DirectiveImplementingAfterViewChecked, new Directive())
                  .callAfterViewChecked).toBe(true);
        });

        it("should be false otherwise", () {
          expect(metadata(DirectiveNoHooks, new Directive())
              .callAfterViewChecked).toBe(false);
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

class DirectiveImplementingAfterContentInit implements AfterContentInit {
  afterContentInit() {}
}

class DirectiveImplementingAfterContentChecked implements AfterContentChecked {
  afterContentChecked() {}
}

class DirectiveImplementingAfterViewInit implements AfterViewInit {
  afterViewInit() {}
}

class DirectiveImplementingAfterViewChecked implements AfterViewChecked {
  afterViewChecked() {}
}
