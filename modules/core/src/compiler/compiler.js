import {Future, Type} from 'facade/lang';
import {Element} from 'facade/dom';
import {ProtoView} from '../view/proto_view';
import {TemplateLoader} from './template_loader';

export class Compiler {

  @FIELD('final _templateLoader:TemplateLoader')
  constructor(templateLoader:TemplateLoader) {
    this._templateLoader = templateLoader;
  }

  /**
   * # Why future?
   *   - compilation will load templates. Instantiating views before templates are loaded will
   *     complicate the Directive code. BENEFIT: view instantiation become synchrnous.
   * # Why result that is independent of injector?
   *   - don't know about injector in deserialization
   *   - compile does not need the injector, only the ViewFactory does
   */
  compile(component:Type, element:Element/* = null*/):Future<ProtoView> {
    return null;
  }


}