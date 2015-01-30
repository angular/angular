import {Type, isPresent, BaseException, stringify} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {Directive, Component} from '../annotations/annotations';
import {DirectiveMetadata} from './directive_metadata';
import {reflector} from 'angular2/src/reflection/reflection';
import {ShadowDom, ShadowDomStrategy, ShadowDomNative} from './shadow_dom_strategy';

export class DirectiveMetadataReader {
  read(type:Type):DirectiveMetadata {
    var annotations = reflector.annotations(type);
    if (isPresent(annotations)) {
      for (var i=0; i<annotations.length; i++) {
        var annotation = annotations[i];

        if (annotation instanceof Component) {
          return new DirectiveMetadata(
            type,
            annotation,
            this.componentDirectivesMetadata(annotation)
          );
        }

        if (annotation instanceof Directive) {
          return new DirectiveMetadata(type, annotation, null);
        }
      }
    }
    throw new BaseException(`No Directive annotation found on ${stringify(type)}`);
  }

  componentDirectivesMetadata(annotation:Component):List<Type> {
    var template = annotation.template;
    return isPresent(template) && isPresent(template.directives) ? template.directives : [];
  }
}
