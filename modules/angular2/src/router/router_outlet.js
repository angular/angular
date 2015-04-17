import {Promise, PromiseWrapper} from 'angular2/src/facade/async';

import {Decorator} from 'angular2/annotations';
import {Compiler, ViewContainerRef} from 'angular2/core';
import {Injector, bind} from 'angular2/di';

import * as routerMod from './router';
import {Instruction, RouteParams} from './instruction'

@Decorator({
  selector: 'router-outlet'
})
export class RouterOutlet {
  _compiler:Compiler;
  _injector:Injector;
  _router:routerMod.Router;
  _viewContainer:ViewContainerRef;

  constructor(viewContainer:ViewContainerRef, compiler:Compiler, router:routerMod.Router, injector:Injector) {
    this._router = router;
    this._viewContainer = viewContainer;
    this._compiler = compiler;
    this._injector = injector;
    this._router.registerOutlet(this);
  }

  activate(instruction:Instruction) {
    return this._compiler.compileInHost(instruction.component).then((pv) => {
      var outletInjector = this._injector.resolveAndCreateChild([
        bind(RouteParams).toValue(new RouteParams(instruction.params)),
        bind(routerMod.Router).toValue(instruction.router)
      ]);

      this._viewContainer.clear();
      this._viewContainer.create(0, pv, outletInjector);
    });
  }

  canActivate(instruction:any) {
    return PromiseWrapper.resolve(true);
  }

  canDeactivate(instruction:any) {
    return PromiseWrapper.resolve(true);
  }
}
