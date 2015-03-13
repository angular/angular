import {Compiler} from './compiler';
import {ShadowDomStrategy} from './shadow_dom_strategy';
import {EventManager} from 'angular2/src/core/events/event_manager';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {PrivateComponentLocation} from './private_component_location';
import {Type} from 'angular2/src/facade/lang';


export class PrivateComponentLoader {
  compiler:Compiler;
  shadowDomStrategy:ShadowDomStrategy;
  eventManager:EventManager;
  directiveMetadataReader:DirectiveMetadataReader;

  constructor(compiler:Compiler, shadowDomStrategy:ShadowDomStrategy,
              eventManager:EventManager, directiveMetadataReader:DirectiveMetadataReader) {

    this.compiler = compiler;
    this.shadowDomStrategy = shadowDomStrategy;
    this.eventManager = eventManager;
    this.directiveMetadataReader = directiveMetadataReader;
  }

  load(type:Type, location:PrivateComponentLocation) {
    var annotation = this.directiveMetadataReader.read(type).annotation;
    return this.compiler.compile(type).then((componentProtoView) => {
      location.createComponent(
        type, annotation,
        componentProtoView,
        this.eventManager,
        this.shadowDomStrategy);
    });
  }
}
