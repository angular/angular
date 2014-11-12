import {Directive} from './directive';
import {CONST} from 'facade/lang';

export class Component extends Directive {
  @CONST()
  constructor({
      selector,
      bind,
      lightDomServices,
      implementsTypes,
      template,
      elementServices,
      componentServices
    }:{
      selector:String,
      bind:Object,
      template:TemplateConfig,
      lightDomServices:DomServicesFunction,
      shadowDomServices:DomServicesFunction,
      componentServices:ComponentServicesFunction,
      implementsTypes:Array<Type>
    }={})
  {
    super({
        selector: selector,
        bind: bind,
        lightDomServices: lightDomServices,
        implementsTypes: implementsTypes});
    this.template = template;
    this.elementServices = elementServices;
    this.componentServices = componentServices;
  }
}

///////////////////////////
/*
import 'package:angular/core.dart' as core;


@Component(
  selector: 'example',
  template: const TemplateConfig(
    url: 'example.dart',
    uses: const [core.CONFIG],
    directives: const [CompA],
    formatters: const [Stringify]
  ),
  componentServices: Example.componentServices,
  elementServices: Example.elementServices,
  implementsTypes: const [App]
)
class Example implements App {
  static componentServices(Module m) {
    m.bind();
  }
  static elementServices(ElementModule m) {
    m.bind();
  }
}

class CompA {}

@Formatter()
class Stringify {}

<CompA>
  LightDOM:
</CompA>

CompA ShadowDOM:
<div>
  <CompB></CompB>
</div>

CompB SHadowDOM:
<div></div>
*/
