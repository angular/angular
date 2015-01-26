import {bootstrap, Component, Decorator, TemplateConfig, NgElement} from 'angular/angular';
import {reflector} from 'reflection/reflection';
import {ReflectionCapabilities} from 'reflection/reflection_capabilities';
import {ShadowDomEmulated, ShadowDomNative} from 'core/compiler/shadow_dom';
import {NgIf} from 'directives/ng_if';


@Component({
  selector: 'parent',
  shadowDom: ShadowDomNative,
  template: new TemplateConfig({
    inline: `<child>1</child><child>2</child><div><style>p_inl{}</style></div><emchild>3</emchild>
      <template [ng-if]="1">NGIF<style>.ngif{}</style></template>`,
    directives: [EmChildCmp, ChildCmp, NgIf],
    cssUrls: ['.parent{}']
  })
})
class ParentCmp {
  constructor() {
  }
}

@Component({
  selector: 'child',
  shadowDom: ShadowDomNative,
  template: new TemplateConfig({
    inline: `<p>CHILD[<content></content>]</p>`,
    cssUrls: ['.child1{}', '.child2{}'],
    directives: [EmChildCmp]
  })
})
class ChildCmp {
  constructor() {
  }
}

@Component({
  selector: 'emchild',
  shadowDom: ShadowDomEmulated,
  template: new TemplateConfig({
    inline: `<p>CHILD_EM[<content></content>]</p><style>cem_inl{}</style>`,
    cssUrls: ['.child_em{}']
  })
})
class EmChildCmp {
  constructor() {
  }
}


export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrap(ParentCmp);
}
