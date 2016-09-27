/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DirectiveResolver} from '@angular/compiler/src/directive_resolver';
import {Component, ContentChild, ContentChildren, Directive, HostBinding, HostListener, Input, Output, ViewChild, ViewChildren} from '@angular/core/src/metadata';

@Directive({selector: 'someDirective'})
class SomeDirective {
}

@Directive({selector: 'someChildDirective'})
class SomeChildDirective extends SomeDirective {
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

@Directive({selector: 'someDirective', outputs: ['a']})
class SomeDirectiveWithDuplicateOutputs {
  @Output() a: any;
}

@Directive({selector: 'someDirective', outputs: ['localA: a']})
class SomeDirectiveWithDuplicateRenamedOutputs {
  @Output() a: any;
  localA: any;
}

@Directive({selector: 'someDirective', inputs: ['a']})
class SomeDirectiveWithDuplicateInputs {
  @Input() a: any;
}

@Directive({selector: 'someDirective', inputs: ['localA: a']})
class SomeDirectiveWithDuplicateRenamedInputs {
  @Input() a: any;
  localA: any;
}

@Directive({selector: 'someDirective'})
class SomeDirectiveWithSetterProps {
  @Input('renamed')
  set a(value: any) {}
}

@Directive({selector: 'someDirective'})
class SomeDirectiveWithGetterOutputs {
  @Output('renamed')
  get a(): any { return null; }
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
  onA() {}
  @HostListener('b', ['$event.value'])
  onB(value: any) {}
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

@Component({selector: 'sample', template: 'some template', styles: ['some styles']})
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

class SomeDirectiveWithoutMetadata {}

export function main() {
  describe('DirectiveResolver', () => {
    let resolver: DirectiveResolver;

    beforeEach(() => { resolver = new DirectiveResolver(); });

    it('should read out the Directive metadata', () => {
      const directiveMetadata = resolver.resolve(SomeDirective);
      expect(directiveMetadata)
          .toEqual(new Directive(
              {selector: 'someDirective', inputs: [], outputs: [], host: {}, queries: {}}));
    });

    it('should throw if not matching metadata is found', () => {
      expect(() => {
        resolver.resolve(SomeDirectiveWithoutMetadata);
      }).toThrowError('No Directive annotation found on SomeDirectiveWithoutMetadata');
    });

    it('should not read parent class Directive metadata', function() {
      const directiveMetadata = resolver.resolve(SomeChildDirective);
      expect(directiveMetadata)
          .toEqual(new Directive(
              {selector: 'someChildDirective', inputs: [], outputs: [], host: {}, queries: {}}));
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

      it('should throw if duplicate inputs', () => {
        expect(() => {
          resolver.resolve(SomeDirectiveWithDuplicateInputs);
        }).toThrowError(`Input 'a' defined multiple times in 'SomeDirectiveWithDuplicateInputs'`);
      });

      it('should throw if duplicate inputs (with rename)', () => {
        expect(() => { resolver.resolve(SomeDirectiveWithDuplicateRenamedInputs); })
            .toThrowError(
                `Input 'a' defined multiple times in 'SomeDirectiveWithDuplicateRenamedInputs'`);
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

      it('should throw if duplicate outputs', () => {
        expect(() => { resolver.resolve(SomeDirectiveWithDuplicateOutputs); })
            .toThrowError(
                `Output event 'a' defined multiple times in 'SomeDirectiveWithDuplicateOutputs'`);
      });

      it('should throw if duplicate outputs (with rename)', () => {
        expect(() => { resolver.resolve(SomeDirectiveWithDuplicateRenamedOutputs); })
            .toThrowError(
                `Output event 'a' defined multiple times in 'SomeDirectiveWithDuplicateRenamedOutputs'`);
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
    });

    describe('Component', () => {
      it('should read out the template related metadata from the Component metadata', () => {
        const compMetadata: Component = resolver.resolve(ComponentWithTemplate);
        expect(compMetadata.template).toEqual('some template');
        expect(compMetadata.styles).toEqual(['some styles']);
      });
    });
  });
}
