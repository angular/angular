import {Type, isPresent, BaseException, stringify} from 'facade/lang';
import {Directive, Component} from '../annotations/annotations';
import {DirectiveMetadata} from './directive_metadata';
import {reflector} from 'reflection/reflection';
import {ShadowDom, ShadowDomStrategy, ShadowDomNative} from './shadow_dom';

export class DirectiveMetadataReader {
  read(type:Type):DirectiveMetadata {
    var annotations = reflector.annotations(type);
    if (isPresent(annotations)) {
      for (var i=0; i<annotations.length; i++) {
        var annotation = annotations[i];

        if (annotation instanceof Component) {
          return new DirectiveMetadata(type, annotation, this.parseShadowDomStrategy(annotation));
        }

        if (annotation instanceof Directive) {
          return new DirectiveMetadata(type, annotation, null);
        }
      }
    }
    throw new BaseException(`No Directive annotation found on ${stringify(type)}`);
  }

  parseShadowDomStrategy(annotation:Component):ShadowDomStrategy{
    return isPresent(annotation.shadowDom) ? annotation.shadowDom : ShadowDomNative;
  }
}
