/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {core} from '@angular/compiler';
import {DirectiveResolver} from '@angular/compiler/src/directive_resolver';
import {Component, ContentChild, ContentChildren, Directive, HostBinding, HostListener, Input, Output, ViewChild, ViewChildren} from '@angular/core/src/metadata';
import {JitReflector} from '@angular/platform-browser-dynamic/src/compiler_reflector';

@Directive({selector: 'someDirective'})
class SomeDirective {
}

@Directive({selector: 'someDirective', inputs: ['c']})
class SomeDirectiveWithInputs {
  @Input() a: any;
  @Input('renamed') b: any;
  c: any;
}

@Directive({selector: 'someDirective', outputs: ['c']})
class SomeDirectiveWithOutputs {
  @Output() a: any;
  @Output('renamed') b: any;
  c: any;
}

@Directive({selector: 'someDirective'})
class SomeDirectiveWithSetterProps {
  @Input('renamed')
  set a(value: any) {
  }
}

@Directive({selector: 'someDirective'})
class SomeDirectiveWithGetterOutputs {
  @Output('renamed')
  get a(): any {
    return null;
  }
}

@Directive({selector: 'someDirective', host: {'[c]': 'c'}})
class SomeDirectiveWithHostBindings {
  @HostBinding() a: any;
  @HostBinding('renamed') b: any;
  c: any;
}

@Directive({selector: 'someDirective', host: {'(c)': 'onC()'}})
class SomeDirectiveWithHostListeners {
  @HostListener('a')
  onA() {
  }
  @HostListener('b', ['$event.value'])
  onB(value: any) {
  }
}

@Directive({selector: 'someDirective', queries: {'cs': new ContentChildren('c')}})
class SomeDirectiveWithContentChildren {
  @ContentChildren('a') as: any;
  c: any;
}

@Directive({selector: 'someDirective', queries: {'cs': new ViewChildren('c')}})
class SomeDirectiveWithViewChildren {
  @ViewChildren('a') as: any;
  c: any;
}

@Directive({selector: 'someDirective', queries: {'c': new ContentChild('c')}})
class SomeDirectiveWithContentChild {
  @ContentChild('a') a: any;
  c: any;
}

@Directive({selector: 'someDirective', queries: {'c': new ViewChild('c')}})
class SomeDirectiveWithViewChild {
  @ViewChild('a') a: any;
  c: any;
}

@Component({
  selector: 'sample',
  template: 'some template',
  styles: ['some styles'],
  preserveWhitespaces: true
})
class ComponentWithTemplate {
}

@Directive({
  selector: 'someDirective',
  host: {'[decorator]': 'decorator'},
  inputs: ['decorator'],
})
class SomeDirectiveWithSameHostBindingAndInput {
  @Input() @HostBinding() prop: any;
}

@Directive({selector: 'someDirective'})
class SomeDirectiveWithMalformedHostBinding1 {
  @HostBinding('(a)')
  onA() {
  }
}

@Directive({selector: 'someDirective'})
class SomeDirectiveWithMalformedHostBinding2 {
  @HostBinding('[a]')
  onA() {
  }
}

class SomeDirectiveWithoutMetadata {}

{
  describe('DirectiveResolver', () => {
    let resolver: DirectiveResolver;

    beforeEach(() => {
      resolver = new DirectiveResolver(new JitReflector());
    });

    it('should read out the Directive metadata', () => {
      const directiveMetadata = resolver.resolve(SomeDirective);
      expect(directiveMetadata).toEqual(core.createDirective({
        selector: 'someDirective',
        inputs: [],
        outputs: [],
        host: {},
        queries: {},
        guards: {},
        exportAs: undefined,
        providers: undefined
      }));
    });

    it('should throw if not matching metadata is found', () => {
      expect(() => {
        resolver.resolve(SomeDirectiveWithoutMetadata);
      }).toThrowError('No Directive annotation found on SomeDirectiveWithoutMetadata');
    });

    it('should support inheriting the Directive metadata', function() {
      @Directive({selector: 'p'})
      class Parent {
      }

      class ChildNoDecorator extends Parent {}

      @Directive({selector: 'c'})
      class ChildWithDecorator extends Parent {
      }

      expect(resolver.resolve(ChildNoDecorator)).toEqual(core.createDirective({
        selector: 'p',
        inputs: [],
        outputs: [],
        host: {},
        queries: {},
        guards: {},
        exportAs: undefined,
        providers: undefined
      }));

      expect(resolver.resolve(ChildWithDecorator)).toEqual(core.createDirective({
        selector: 'c',
        inputs: [],
        outputs: [],
        host: {},
        queries: {},
        guards: {},
        exportAs: undefined,
        providers: undefined
      }));
    });

    describe('inputs', () => {
      it('should append directive inputs', () => {
        const directiveMetadata = resolver.resolve(SomeDirectiveWithInputs);
        expect(directiveMetadata.inputs).toEqual(['c', 'a', 'b: renamed']);
      });

      it('should work with getters and setters', () => {
        const directiveMetadata = resolver.resolve(SomeDirectiveWithSetterProps);
        expect(directiveMetadata.inputs).toEqual(['a: renamed']);
      });

      it('should remove duplicate inputs', () => {
        @Directive({selector: 'someDirective', inputs: ['a', 'a']})
        class SomeDirectiveWithDuplicateInputs {
        }

        const directiveMetadata = resolver.resolve(SomeDirectiveWithDuplicateInputs);
        expect(directiveMetadata.inputs).toEqual(['a']);
      });

      it('should use the last input if duplicate inputs (with rename)', () => {
        @Directive({selector: 'someDirective', inputs: ['a', 'localA: a']})
        class SomeDirectiveWithDuplicateInputs {
        }

        const directiveMetadata = resolver.resolve(SomeDirectiveWithDuplicateInputs);
        expect(directiveMetadata.inputs).toEqual(['localA: a']);
      });

      it('should prefer @Input over @Directive.inputs', () => {
        @Directive({selector: 'someDirective', inputs: ['a']})
        class SomeDirectiveWithDuplicateInputs {
          @Input('a') propA: any;
        }
        const directiveMetadata = resolver.resolve(SomeDirectiveWithDuplicateInputs);
        expect(directiveMetadata.inputs).toEqual(['propA: a']);
      });

      it('should support inheriting inputs', () => {
        @Directive({selector: 'p'})
        class Parent {
          @Input() p1: any;
          @Input('p21') p2: any;
        }

        class Child extends Parent {
          @Input('p22') override p2: any;
          @Input() p3: any;
        }

        const directiveMetadata = resolver.resolve(Child);
        expect(directiveMetadata.inputs).toEqual(['p1', 'p2: p22', 'p3']);
      });
    });

    describe('outputs', () => {
      it('should append directive outputs', () => {
        const directiveMetadata = resolver.resolve(SomeDirectiveWithOutputs);
        expect(directiveMetadata.outputs).toEqual(['c', 'a', 'b: renamed']);
      });

      it('should work with getters and setters', () => {
        const directiveMetadata = resolver.resolve(SomeDirectiveWithGetterOutputs);
        expect(directiveMetadata.outputs).toEqual(['a: renamed']);
      });

      it('should remove duplicate outputs', () => {
        @Directive({selector: 'someDirective', outputs: ['a', 'a']})
        class SomeDirectiveWithDuplicateOutputs {
        }

        const directiveMetadata = resolver.resolve(SomeDirectiveWithDuplicateOutputs);
        expect(directiveMetadata.outputs).toEqual(['a']);
      });

      it('should use the last output if duplicate outputs (with rename)', () => {
        @Directive({selector: 'someDirective', outputs: ['a', 'localA: a']})
        class SomeDirectiveWithDuplicateOutputs {
        }

        const directiveMetadata = resolver.resolve(SomeDirectiveWithDuplicateOutputs);
        expect(directiveMetadata.outputs).toEqual(['localA: a']);
      });

      it('should prefer @Output over @Directive.outputs', () => {
        @Directive({selector: 'someDirective', outputs: ['a']})
        class SomeDirectiveWithDuplicateOutputs {
          @Output('a') propA: any;
        }
        const directiveMetadata = resolver.resolve(SomeDirectiveWithDuplicateOutputs);
        expect(directiveMetadata.outputs).toEqual(['propA: a']);
      });

      it('should support inheriting outputs', () => {
        @Directive({selector: 'p'})
        class Parent {
          @Output() p1: any;
          @Output('p21') p2: any;
        }

        class Child extends Parent {
          @Output('p22') override p2: any;
          @Output() p3: any;
        }

        const directiveMetadata = resolver.resolve(Child);
        expect(directiveMetadata.outputs).toEqual(['p1', 'p2: p22', 'p3']);
      });
    });

    describe('host', () => {
      it('should append host bindings', () => {
        const directiveMetadata = resolver.resolve(SomeDirectiveWithHostBindings);
        expect(directiveMetadata.host).toEqual({'[c]': 'c', '[a]': 'a', '[renamed]': 'b'});
      });

      it('should append host binding and input on the same property', () => {
        const directiveMetadata = resolver.resolve(SomeDirectiveWithSameHostBindingAndInput);
        expect(directiveMetadata.host).toEqual({'[decorator]': 'decorator', '[prop]': 'prop'});
        expect(directiveMetadata.inputs).toEqual(['decorator', 'prop']);
      });

      it('should append host listeners', () => {
        const directiveMetadata = resolver.resolve(SomeDirectiveWithHostListeners);
        expect(directiveMetadata.host)
            .toEqual({'(c)': 'onC()', '(a)': 'onA()', '(b)': 'onB($event.value)'});
      });

      it('should throw when @HostBinding name starts with "("', () => {
        expect(() => resolver.resolve(SomeDirectiveWithMalformedHostBinding1))
            .toThrowError('@HostBinding can not bind to events. Use @HostListener instead.');
      });

      it('should throw when @HostBinding name starts with "["', () => {
        expect(() => resolver.resolve(SomeDirectiveWithMalformedHostBinding2))
            .toThrowError(
                `@HostBinding parameter should be a property name, 'class.<name>', or 'attr.<name>'.`);
      });

      it('should support inheriting host bindings', () => {
        @Directive({selector: 'p'})
        class Parent {
          @HostBinding() p1: any;
          @HostBinding('p21') p2: any;
        }

        class Child extends Parent {
          @HostBinding('p22') override p2: any;
          @HostBinding() p3: any;
        }

        const directiveMetadata = resolver.resolve(Child);
        expect(directiveMetadata.host)
            .toEqual({'[p1]': 'p1', '[p21]': 'p2', '[p22]': 'p2', '[p3]': 'p3'});
      });

      it('should support inheriting host listeners', () => {
        @Directive({selector: 'p'})
        class Parent {
          @HostListener('p1')
          p1() {
          }
          @HostListener('p21')
          p2() {
          }
        }

        class Child extends Parent {
          @HostListener('p22')
          override p2() {
          }
          @HostListener('p3')
          p3() {
          }
        }

        const directiveMetadata = resolver.resolve(Child);
        expect(directiveMetadata.host)
            .toEqual({'(p1)': 'p1()', '(p21)': 'p2()', '(p22)': 'p2()', '(p3)': 'p3()'});
      });

      it('should combine host bindings and listeners during inheritance', () => {
        @Directive({selector: 'p'})
        class Parent {
          @HostListener('p11')
          @HostListener('p12')
          p1() {
          }

          @HostBinding('p21') @HostBinding('p22') p2: any;
        }

        class Child extends Parent {
          @HostListener('c1')
          override p1() {
          }

          @HostBinding('c2') override p2: any;
        }

        const directiveMetadata = resolver.resolve(Child);
        expect(directiveMetadata.host).toEqual({
          '(p11)': 'p1()',
          '(p12)': 'p1()',
          '(c1)': 'p1()',
          '[p21]': 'p2',
          '[p22]': 'p2',
          '[c2]': 'p2'
        });
      });
    });

    describe('queries', () => {
      it('should append ContentChildren', () => {
        const directiveMetadata = resolver.resolve(SomeDirectiveWithContentChildren);
        expect(directiveMetadata.queries)
            .toEqual({'cs': new ContentChildren('c'), 'as': new ContentChildren('a')});
      });

      it('should append ViewChildren', () => {
        const directiveMetadata = resolver.resolve(SomeDirectiveWithViewChildren);
        expect(directiveMetadata.queries)
            .toEqual({'cs': new ViewChildren('c'), 'as': new ViewChildren('a')});
      });

      it('should append ContentChild', () => {
        const directiveMetadata = resolver.resolve(SomeDirectiveWithContentChild);
        expect(directiveMetadata.queries)
            .toEqual({'c': new ContentChild('c'), 'a': new ContentChild('a')});
      });

      it('should append ViewChild', () => {
        const directiveMetadata = resolver.resolve(SomeDirectiveWithViewChild);
        expect(directiveMetadata.queries)
            .toEqual({'c': new ViewChild('c'), 'a': new ViewChild('a')});
      });

      it('should support inheriting queries', () => {
        @Directive({selector: 'p'})
        class Parent {
          @ContentChild('p1') p1: any;
          @ContentChild('p21') p2: any;
        }

        class Child extends Parent {
          @ContentChild('p22') override p2: any;
          @ContentChild('p3') p3: any;
        }

        const directiveMetadata = resolver.resolve(Child);
        expect(directiveMetadata.queries).toEqual({
          'p1': new ContentChild('p1'),
          'p2': new ContentChild('p22'),
          'p3': new ContentChild('p3')
        });
      });
    });

    describe('Component', () => {
      it('should read out the template related metadata from the Component metadata', () => {
        const compMetadata: Component = resolver.resolve(ComponentWithTemplate);
        expect(compMetadata.template).toEqual('some template');
        expect(compMetadata.styles).toEqual(['some styles']);
        expect(compMetadata.preserveWhitespaces).toBe(true);
      });
    });
  });
}
