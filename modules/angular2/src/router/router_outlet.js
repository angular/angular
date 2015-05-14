import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {isBlank} from 'angular2/src/facade/lang';

import {Directive} from 'angular2/src/core/annotations_impl/annotations';
import {Attribute} from 'angular2/src/core/annotations_impl/di';
import {Compiler, ViewContainerRef} from 'angular2/core';
import {Injector, bind} from 'angular2/di';

import * as routerMod from './router';
import {Instruction, RouteParams} from './instruction'

@Directive({
  selector: 'router-outlet'
})
export class RouterOutlet {
  _compiler:Compiler;
  _injector:Injector;
  _router:routerMod.Router;
  _viewContainer:ViewContainerRef;

  constructor(viewContainer:ViewContainerRef, compiler:Compiler, router:routerMod.Router, injector:Injector, @Attribute('name') nameAttr:String) {
    if (isBlank(nameAttr)) {
      nameAttr = 'default';
    }
    this._router = router;
    this._viewContainer = viewContainer;
    this._compiler = compiler;
    this._injector = injector;
    this._router.registerOutlet(this, nameAttr);
  }

  activate(instruction:Instruction): Promise {
    return this._compiler.compileInHost(instruction.component).then((pv) => {
      var outletInjector = this._injector.resolveAndCreateChild([
        bind(RouteParams).toValue(new RouteParams(instruction.params)),
        bind(routerMod.Router).toValue(instruction.router)
      ]);

      this._viewContainer.clear();
      this._viewContainer.create(pv, 0, null, outletInjector);
    });
  }

  canActivate(instruction:Instruction): Promise<boolean> {
    return PromiseWrapper.resolve(true);
  }

  canDeactivate(instruction:Instruction): Promise<boolean> {
    return PromiseWrapper.resolve(true);
  }
}
