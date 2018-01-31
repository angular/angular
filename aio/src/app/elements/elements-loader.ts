import { Inject, NgModule, ModuleWithProviders, NgModuleFactoryLoader, NgModuleRef, InjectionToken } from '@angular/core';
import { ROUTES } from '@angular/router';
import { registerAsCustomElements } from '@angular/elements';

export const ElementsMap = new InjectionToken('aio/elements-map');

interface ElementRegistration {
  selector:string;
  loadChildren:string;
}

@NgModule()
export class ElementsLoader {
  constructor(private loader: NgModuleFactoryLoader, @Inject(ElementsMap) private elementsMap:ElementRegistration[], private applicationRef:NgModuleRef<any>){

    this.resolve('aio-api-list')
  }

  resolve(selector:string){
    let Ctor = customElements.get(selector);
    if(!Ctor){
      const reg = this.elementsMap.find(r => r.selector === selector);
      if(!reg){
        throw `no element named ${selector} found!`
      }
      return this.loader.load(reg.loadChildren)
        .then(mod => registerAsCustomElements((mod.moduleType['customElements'] as any[]),
          () => Promise.resolve(this.applicationRef).then(ref => mod.create(ref.injector))
        )
        .then(() => customElements.whenDefined(selector)
        .then(() => customElements.get(selector)))
      );
    }
    return customElements.whenDefined(selector)
      .then(() => customElements.get(selector));
  }

  static withElements(elementsMap:any):ModuleWithProviders {
    return {
      ngModule: ElementsLoader,
      providers: [
        { provide: ElementsMap, useValue: elementsMap },
        { provide: ROUTES, useValue: elementsMap, multi: true}
      ]
    }
  }
}
