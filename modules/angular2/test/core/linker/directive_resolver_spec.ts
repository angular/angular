import {ddescribe, describe, it, iit, expect, beforeEach} from 'angular2/test_lib';
import {DirectiveResolver} from 'angular2/src/core/linker/directive_resolver';
import {
  DirectiveMetadata,
  Directive,
  Input,
  Output,
  HostBinding,
  HostListener,
  ContentChildren,
  ContentChildrenMetadata,
  ViewChildren,
  ViewChildrenMetadata,
  ContentChild,
  ContentChildMetadata,
  ViewChild,
  ViewChildMetadata
} from 'angular2/src/core/metadata';

@Directive({selector: 'someDirective'})
class SomeDirective {
}

@Directive({selector: 'someChildDirective'})
class SomeChildDirective extends SomeDirective {
}

@Directive({selector: 'someDirective', inputs: ['c']})
class SomeDirectiveWithInputs {
  @Input() a;
  @Input("renamed") b;
  c;
}

@Directive({selector: 'someDirective', outputs: ['c']})
class SomeDirectiveWithOutputs {
  @Output() a;
  @Output("renamed") b;
  c;
}

@Directive({selector: 'someDirective', properties: ['a']})
class SomeDirectiveWithProperties {
}

@Directive({selector: 'someDirective', events: ['a']})
class SomeDirectiveWithEvents {
}



@Directive({selector: 'someDirective'})
class SomeDirectiveWithSetterProps {
  @Input("renamed")
  set a(value) {
  }
}

@Directive({selector: 'someDirective'})
class SomeDirectiveWithGetterOutputs {
  @Output("renamed")
  get a() {
    return null;
  }
}

@Directive({selector: 'someDirective', host: {'[c]': 'c'}})
class SomeDirectiveWithHostBindings {
  @HostBinding() a;
  @HostBinding("renamed") b;
  c;
}

@Directive({selector: 'someDirective', host: {'(c)': 'onC()'}})
class SomeDirectiveWithHostListeners {
  @HostListener('a')
  onA() {
  }
  @HostListener('b', ['$event.value'])
  onB(value) {
  }
}

@Directive({selector: 'someDirective', queries: {"c": new ContentChildren(SomeChildDirective)}})
class SomeDirectiveWithContentChildren {
  @ContentChildren(SomeDirective) a: any;
  c;
}

@Directive(
    {selector: 'someDirective', queries: {"c": new ContentChildren(SomeDirectiveWithViewChildren)}})
class SomeDirectiveWithWrongContentChildren {
  @ContentChildren(SomeDirective) a: any;
  c;
}

@Directive({selector: 'someDirective', queries: {"c": new ViewChildren(SomeChildDirective)}})
class SomeDirectiveWithViewChildren {
  @ViewChildren(SomeDirective) a: any;
  c;
}

@Directive(
    {selector: 'someDirective', queries: {"c": new ViewChildren(SomeDirectiveWithContentChild)}})
class SomeDirectiveWithWrongViewChildren {
  @ViewChildren(SomeDirective) a: any;
  c;
}

@Directive({selector: 'someDirective', queries: {"c": new ContentChild(SomeChildDirective)}})
class SomeDirectiveWithContentChild {
  @ContentChild(SomeDirective) a: any;
  c;
}

@Directive({selector: 'someDirective', queries: {"c": new ContentChild(SomeChildDirective)}})
class SomeDirectiveWithWrongContentChild {
  @ContentChild(SomeDirectiveWithViewChild) a: any;
  c;
}

@Directive({selector: 'someDirective', queries: {"c": new ViewChild(SomeChildDirective)}})
class SomeDirectiveWithViewChild {
  @ViewChild(SomeDirective) a: any;
  c;
}

@Directive({selector: 'someDirective', queries: {"c": new ViewChild(SomeDirectiveWithoutMetadata)}})
class SomeDirectiveWithWrongViewChild {
  @ViewChild(SomeDirective) a: any;
  c;
}

class SomeDirectiveWithoutMetadata {}

export function main() {
  describe("DirectiveResolver", () => {
    var resolver;

    beforeEach(() => { resolver = new DirectiveResolver(); });

    it('should read out the Directive metadata', () => {
      var directiveMetadata = resolver.resolve(SomeDirective);
      expect(directiveMetadata)
          .toEqual(new DirectiveMetadata(
              {selector: 'someDirective', inputs: [], outputs: [], host: {}, queries: {}}));
    });

    it('should throw if not matching metadata is found', () => {
      expect(() => { resolver.resolve(SomeDirectiveWithoutMetadata); })
          .toThrowError('No Directive annotation found on SomeDirectiveWithoutMetadata');
    });

    it('should not read parent class Directive metadata', function() {
      var directiveMetadata = resolver.resolve(SomeChildDirective);
      expect(directiveMetadata)
          .toEqual(new DirectiveMetadata(
              {selector: 'someChildDirective', inputs: [], outputs: [], host: {}, queries: {}}));
    });

    describe('inputs', () => {
      it('should append directive inputs', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithInputs);
        expect(directiveMetadata.inputs).toEqual(['c', 'a', 'b: renamed']);
      });

      it('should work with getters and setters', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithSetterProps);
        expect(directiveMetadata.inputs).toEqual(['a: renamed']);
      });

      it('should use properties as inputs', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithProperties);
        expect(directiveMetadata.inputs).toEqual(['a']);
      });

    });

    describe('outputs', () => {
      it('should append directive outputs', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithOutputs);
        expect(directiveMetadata.outputs).toEqual(['c', 'a', 'b: renamed']);
      });

      it('should work with getters and setters', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithGetterOutputs);
        expect(directiveMetadata.outputs).toEqual(['a: renamed']);
      });

      it('should use events as outputs', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithEvents);
        expect(directiveMetadata.outputs).toEqual(['a']);
      });
    });

    describe('host', () => {
      it('should append host bindings', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithHostBindings);
        expect(directiveMetadata.host).toEqual({'[c]': 'c', '[a]': 'a', '[renamed]': 'b'});
      });

      it('should append host listeners', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithHostListeners);
        expect(directiveMetadata.host)
            .toEqual({'(c)': 'onC()', '(a)': 'onA()', '(b)': 'onB($event.value)'});
      });
    });

    describe('queries', () => {
      it('should append ContentChildren', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithContentChildren);
        expect(directiveMetadata.queries)
            .toEqual({
              "c": new ContentChildren(SomeChildDirective),
              "a": new ContentChildren(SomeDirective)
            });
      });

      it('should fail appending ContentChildren when is used inappropriate selector', () => {
        expect(() => resolver.resolve(SomeDirectiveWithWrongContentChildren))
            .toThrowError(
                "Unexpected directive value 'undefined' on the '@ContentChildren(undefined)' of component 'SomeDirectiveWithWrongContentChildren'");
      });

      it('should append ViewChildren', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithViewChildren);
        expect(directiveMetadata.queries)
            .toEqual(
                {"c": new ViewChildren(SomeChildDirective), "a": new ViewChildren(SomeDirective)});
      });

      it('should fail appending ViewChildren when is used inappropriate selector', () => {
        expect(() => resolver.resolve(SomeDirectiveWithWrongViewChildren))
            .toThrowError(
                "Unexpected directive value 'undefined' on the '@ViewChildren(undefined)' of component 'SomeDirectiveWithWrongViewChildren'");
      });


      it('should append ContentChild', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithContentChild);
        expect(directiveMetadata.queries)
            .toEqual(
                {"c": new ContentChild(SomeChildDirective), "a": new ContentChild(SomeDirective)});
      });

      it('should fail appending ContentChild when is used inappropriate selector', () => {
        expect(() => resolver.resolve(SomeDirectiveWithWrongContentChild))
            .toThrowError(
                "Unexpected directive value 'undefined' on the '@ContentChild(undefined)' of component 'SomeDirectiveWithWrongContentChild'");
      });

      it('should append ViewChild', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithViewChild);
        expect(directiveMetadata.queries)
            .toEqual({"c": new ViewChild(SomeChildDirective), "a": new ViewChild(SomeDirective)});
      });

      it('should fail appending ViewChild when is used inappropriate selector', () => {
        expect(() => resolver.resolve(SomeDirectiveWithWrongViewChild))
            .toThrowError(
                "Unexpected directive value 'undefined' on the '@ViewChild(undefined)' of component 'SomeDirectiveWithWrongViewChild'");
      });
    });
  });
}
