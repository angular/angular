import {Type} from 'facade/lang';
import {Promise} from 'facade/async';
import {Element} from 'facade/dom';
//import {ProtoView} from './view';
import {TemplateLoader} from './template_loader';
import {FIELD} from 'facade/lang';

export class Compiler {

  @FIELD('final _templateLoader:TemplateLoader')
  constructor(templateLoader:TemplateLoader) {
    this._templateLoader = templateLoader;
  }

  /**
   * # Why promise?
   *   - compilation will load templates. Instantiating views before templates are loaded will
   *     complicate the Directive code. BENEFIT: view instantiation become synchrnous.
   * # Why result that is independent of injector?
   *   - don't know about injector in deserialization
   *   - compile does not need the injector, only the ViewFactory does
   */
  compile(component:Type, element:Element/* = null*/):Promise/*<ProtoView>*/ {
    return null;
  }


}
