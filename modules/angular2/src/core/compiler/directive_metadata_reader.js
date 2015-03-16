import {Injectable} from 'angular2/di';
import {Type, isPresent, BaseException, stringify} from 'angular2/src/facade/lang';
import {Directive} from '../annotations/annotations';
import {DirectiveMetadata} from './directive_metadata';
import {reflector} from 'angular2/src/reflection/reflection';

@Injectable()
export class DirectiveMetadataReader {
  read(type:Type):DirectiveMetadata {
    var annotations = reflector.annotations(type);
    if (isPresent(annotations)) {
      for (var i=0; i<annotations.length; i++) {
        var annotation = annotations[i];

        if (annotation instanceof Directive) {
          return new DirectiveMetadata(type, annotation);
        }
      }
    }
    throw new BaseException(`No Directive annotation found on ${stringify(type)}`);
  }

}
