library angular2.test.core.compiler.directive_lifecycle_spec;

import 'package:angular2/testing_internal.dart';
import 'package:angular2/src/core/linker/directive_lifecycle_reflector.dart';
import 'package:angular2/src/core/linker/interfaces.dart';

main() {
  describe('Create DirectiveMetadata', () {
    describe('lifecycle', () {

      describe("onChanges", () {
        it("should be true when the directive has the onChanges method", () {
          expect(hasLifecycleHook(LifecycleHooks.OnChanges, DirectiveImplementingOnChanges))
              .toBe(true);
        });

        it("should be false otherwise", () {
          expect(hasLifecycleHook(LifecycleHooks.OnChanges, DirectiveNoHooks)).toBe(false);
        });
      });

      describe("onDestroy", () {
        it("should be true when the directive has the onDestroy method", () {
          expect(hasLifecycleHook(LifecycleHooks.OnDestroy, DirectiveImplementingOnDestroy))
              .toBe(true);
        });

        it("should be false otherwise", () {
          expect(hasLifecycleHook(LifecycleHooks.OnDestroy, DirectiveNoHooks)).toBe(false);
        });
      });

      describe("onInit", () {
        it("should be true when the directive has the onInit method", () {
          expect(hasLifecycleHook(LifecycleHooks.OnInit, DirectiveImplementingOnInit))
              .toBe(true);
        });

        it("should be false otherwise", () {
          expect(hasLifecycleHook(LifecycleHooks.OnInit, DirectiveNoHooks)).toBe(false);
        });
      });

      describe("doCheck", () {
        it("should be true when the directive has the doCheck method", () {
          expect(hasLifecycleHook(LifecycleHooks.DoCheck, DirectiveImplementingOnCheck))
              .toBe(true);
        });

        it("should be false otherwise", () {
          expect(hasLifecycleHook(LifecycleHooks.DoCheck, DirectiveNoHooks)).toBe(false);
        });
      });

      describe("afterContentInit", () {
        it("should be true when the directive has the afterContentInit method", () {
          expect(hasLifecycleHook(LifecycleHooks.AfterContentInit, DirectiveImplementingAfterContentInit))
              .toBe(true);
        });

        it("should be false otherwise", () {
          expect(hasLifecycleHook(LifecycleHooks.AfterContentInit, DirectiveNoHooks))
              .toBe(false);
        });
      });

      describe("afterContentChecked", () {
        it("should be true when the directive has the afterContentChecked method", () {
          expect(hasLifecycleHook(LifecycleHooks.AfterContentChecked, DirectiveImplementingAfterContentChecked))
              .toBe(true);
        });

        it("should be false otherwise", () {
          expect(hasLifecycleHook(LifecycleHooks.AfterContentChecked, DirectiveNoHooks))
              .toBe(false);
        });
      });


      describe("afterViewInit", () {
        it("should be true when the directive has the afterViewInit method", () {
          expect(hasLifecycleHook(LifecycleHooks.AfterViewInit, DirectiveImplementingAfterViewInit))
              .toBe(true);
        });

        it("should be false otherwise", () {
          expect(hasLifecycleHook(LifecycleHooks.AfterViewInit, DirectiveNoHooks)).toBe(false);
        });
      });

      describe("afterViewChecked", () {
        it("should be true when the directive has the afterViewChecked method", () {
          expect(hasLifecycleHook(LifecycleHooks.AfterViewChecked, DirectiveImplementingAfterViewChecked))
              .toBe(true);
        });

        it("should be false otherwise", () {
          expect(hasLifecycleHook(LifecycleHooks.AfterViewChecked, DirectiveNoHooks))
              .toBe(false);
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
