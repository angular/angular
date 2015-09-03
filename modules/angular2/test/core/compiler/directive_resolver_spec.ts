import {ddescribe, describe, it, iit, expect, beforeEach} from 'angular2/test_lib';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {DirectiveMetadata, Directive, Property, Event} from 'angular2/metadata';

@Directive({selector: 'someDirective'})
class SomeDirective {
}

@Directive({selector: 'someChildDirective'})
class SomeChildDirective extends SomeDirective {
}

@Directive({selector: 'someDirective', properties: ['c']})
class SomeDirectiveWithProps {
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


class SomeDirectiveWithoutMetadata {}

export function main() {
  describe("DirectiveResolver", () => {
    var resolver;

    beforeEach(() => { resolver = new DirectiveResolver(); });

    it('should read out the Directive metadata', () => {
      var directiveMetadata = resolver.resolve(SomeDirective);
      expect(directiveMetadata)
          .toEqual(new DirectiveMetadata({selector: 'someDirective', properties: [], events: []}));
    });

    it('should throw if not matching metadata is found', () => {
      expect(() => { resolver.resolve(SomeDirectiveWithoutMetadata); })
          .toThrowError('No Directive annotation found on SomeDirectiveWithoutMetadata');
    });

    it('should not read parent class Directive metadata', function() {
      var directiveMetadata = resolver.resolve(SomeChildDirective);
      expect(directiveMetadata)
          .toEqual(
              new DirectiveMetadata({selector: 'someChildDirective', properties: [], events: []}));
    });

    describe('properties', () => {
      it('should append directive properties', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithProps);
        expect(directiveMetadata)
            .toEqual(new DirectiveMetadata(
                {selector: 'someDirective', properties: ['c', 'a', 'b: renamed'], events: []}));
      });

      it('should work with getters and setters', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithSetterProps);
        expect(directiveMetadata)
            .toEqual(new DirectiveMetadata(
                {selector: 'someDirective', properties: ['a: renamed'], events: []}));
      });
    });

    describe('events', () => {
      it('should append directive events', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithEvents);
        expect(directiveMetadata)
            .toEqual(new DirectiveMetadata(
                {selector: 'someDirective', properties: [], events: ['c', 'a', 'b: renamed']}));
      });

      it('should work with getters and setters', () => {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithGetterEvents);
        expect(directiveMetadata)
            .toEqual(new DirectiveMetadata(
                {selector: 'someDirective', properties: [], events: ['a: renamed']}));
      });
    });
  });
}
