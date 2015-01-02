import {Type, isPresent, BaseException, stringify} from 'facade/lang';
import {List, ListWrapper} from 'facade/collection';
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
          var shadowDomStrategy = this.parseShadowDomStrategy(annotation);
          return new DirectiveMetadata(
            type,
            annotation,
            shadowDomStrategy,
            this.componentDirectivesMetadata(annotation, shadowDomStrategy)
          );
        }

        if (annotation instanceof Directive) {
          return new DirectiveMetadata(type, annotation, null, null);
        }
      }
    }
    throw new BaseException(`No Directive annotation found on ${stringify(type)}`);
  }

  parseShadowDomStrategy(annotation:Component):ShadowDomStrategy{
    return isPresent(annotation.shadowDom) ? annotation.shadowDom : ShadowDomNative;
  }

  componentDirectivesMetadata(annotation:Component, shadowDomStrategy:ShadowDomStrategy):List<Type> {
    var polyDirs = shadowDomStrategy.polyfillDirectives();
    var template = annotation.template;
    var templateDirs = isPresent(template) && isPresent(template.directives) ? template.directives : [];

    var res = [];
    res = ListWrapper.concat(res, templateDirs)
    res = ListWrapper.concat(res, polyDirs)

    return res;
  }
}
