import {Directive} from './directive';
import {CONST} from 'facade/lang';

export class Component extends Directive {
  @CONST()
  constructor({
      selector,
      bind,
      template,
      lightDomServices,
      shadowDomServices,
      componentServices,
      implementsTypes
    }:{
      selector:String,
      bind:Object,
      template:TemplateConfig,
      lightDomServices:List,
      shadowDomServices:List,
      componentServices:List,
      implementsTypes:List
    }={})
  {
    super({
        selector: selector,
        bind: bind,
        lightDomServices: lightDomServices,
        implementsTypes: implementsTypes});
    this.template = template;
    this.lightDomServices = lightDomServices;
    this.shadowDomServices = shadowDomServices;
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
  componentServices: [...],
  shadowDomServices: [...]
  implementsTypes: const [App]
)
class Example implements App {}

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
