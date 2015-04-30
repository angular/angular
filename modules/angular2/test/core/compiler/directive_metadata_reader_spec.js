import {isPresent} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';
import {ddescribe, describe, it, iit, expect, beforeEach} from 'angular2/test_lib';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {Directive, Component} from 'angular2/src/core/annotations_impl/annotations';
import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';
import {Injectable, Injector} from 'angular2/di';

@Injectable()
class SomeInjectable {}

@Directive({selector: 'someDirective'})
class SomeDirective {}

@Component({selector: 'someComponent', injectables: [SomeInjectable]})
class SomeComponent {}

class SomeDirectiveWithoutAnnotation {
}

export function main() {
  describe("DirectiveMetadataReader", () => {
    var reader;

    beforeEach(() => {
      reader = new DirectiveMetadataReader();
    });

    it('should read out the Directive annotation', () => {
      var directiveMetadata = reader.read(SomeDirective);
      expect(directiveMetadata).toEqual(
        new DirectiveMetadata(SomeDirective, new Directive({selector: 'someDirective'}), null));
    });

    it('should read out the Component annotation', () => {
      var m = reader.read(SomeComponent);
      // For some reason `toEqual` fails to compare ResolvedBinding objects.
      // Have to decompose and compare.
      expect(m.type).toEqual(SomeComponent);
      expect(m.annotation)
          .toEqual(new Component({selector: 'someComponent', injectables: [SomeInjectable]}));
      var resolvedList = ListWrapper.reduce(m.resolvedInjectables, function(prev, elem) {
        if (isPresent(elem)) {
          ListWrapper.push(prev, elem);
        }
        return prev;
      }, []);
      expect(resolvedList.length).toBe(1);
      expect(resolvedList[0].key.token).toBe(SomeInjectable);
    });

    it('should throw if not matching annotation is found', () => {
      expect(() => {
        reader.read(SomeDirectiveWithoutAnnotation);
      }).toThrowError('No Directive annotation found on SomeDirectiveWithoutAnnotation');
    });
  });
}
