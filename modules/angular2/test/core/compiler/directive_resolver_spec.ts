import {ddescribe, describe, it, iit, expect, beforeEach} from 'angular2/test_lib';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {
  DirectiveMetadata,
  Directive,
  Property,
  Event,
  HostBinding,
  HostListener
} from 'angular2/src/core/metadata';

@Directive({selector: 'someDirective'})
class SomeDirective {
}

@Directive({selector: 'someChildDirective'})
class SomeChildDirective extends SomeDirective {
}

@Directive({selector: 'someDirective', properties: ['c']})
class SomeDirectiveWithProperties {
  @Property() a;
  @Property("renamed") b;
  c;
}

@Directive({selector: 'someDirective', events: ['c']})
class SomeDirectiveWithEvents {
  @Event() a;
  @Event("renamed") b;
  c;
}


@Directive({selector: 'someDirective'})
class SomeDirectiveWithSetterProps {
  @Property("renamed")
  set a(value) {
  }
}

@Directive({selector: 'someDirective'})
class SomeDirectiveWithGetterEvents {
  @Event("renamed")
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


class SomeDirectiveWithoutMetadata {}

export function main() {
  describe("DirectiveResolver", () => {
    var resolver;

    beforeEach(() => { resolver = new DirectiveResolver(); });

    it('should read out the Directive metadata', () => {
      var directiveMetadata = resolver.resolve(SomeDirective);
      expect(directiveMetadata)
          .toEqual(new DirectiveMetadata(
              {selector: 'someDirective', properties: [], events: [], host: {}}));
    });

    it('should throw if not matching metadata is found', () => {
      expect(() => { resolver.resolve(SomeDirectiveWithoutMetadata); })
          .toThrowError('No Directive annotation found on SomeDirectiveWithoutMetadata');
    });

    it('should not read parent class Directive metadata', function() {
      var directiveMetadata = resolver.resolve(SomeChildDirective);
      expect(directiveMetadata)
          .toEqual(new DirectiveMetadata(
              {selector: 'someChildDirective', properties: [], events: [], host: {}}));
    });

    describe('properties', () => {
      it('should append directive properties', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithProperties);
        expect(directiveMetadata.properties).toEqual(['c', 'a', 'b: renamed']);
      });

      it('should work with getters and setters', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithSetterProps);
        expect(directiveMetadata.properties).toEqual(['a: renamed']);
      });
    });

    describe('events', () => {
      it('should append directive events', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithEvents);
        expect(directiveMetadata.events).toEqual(['c', 'a', 'b: renamed']);
      });

      it('should work with getters and setters', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithGetterEvents);
        expect(directiveMetadata.events).toEqual(['a: renamed']);
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
  });
}
