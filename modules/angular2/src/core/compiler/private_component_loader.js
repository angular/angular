import {Compiler} from './compiler';
import {ViewFactory} from './view_factory';
import {Injectable} from 'angular2/di';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {Component} from 'angular2/src/core/annotations/annotations';
import {PrivateComponentLocation} from './private_component_location';
import {Type, stringify, BaseException} from 'angular2/src/facade/lang';


@Injectable()
export class PrivateComponentLoader {
  compiler:Compiler;
  directiveMetadataReader:DirectiveMetadataReader;
  viewFactory:ViewFactory;

  constructor(compiler:Compiler, directiveMetadataReader:DirectiveMetadataReader, viewFactory:ViewFactory) {

    this.compiler = compiler;
    this.directiveMetadataReader = directiveMetadataReader;
    this.viewFactory = viewFactory;
  }

  load(type:Type, location:PrivateComponentLocation) {
    var annotation = this.directiveMetadataReader.read(type).annotation;

    if (!(annotation instanceof Component)) {
      throw new BaseException(`Could not load '${stringify(type)}' because it is not a component.`);
    }

    return this.compiler.compile(type).then((componentProtoView) => {
      location.createComponent(
        this.viewFactory,
        type, annotation,
        componentProtoView
      );
    });
  }
}
