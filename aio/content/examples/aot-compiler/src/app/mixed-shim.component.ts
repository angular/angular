///// Workaround shimmed version - only for AOT ////////

import { Component } from '@angular/core';
import { dgMixinDefault, fooMixin, lcHookMixin } from './mixins';

// Chain mixin functions for the component to be extended
const demoMix = fooMixin(lcHookMixin(dgMixinDefault));


////////////////////////////
/// THIS SHIM CLASS FOR AOT IS THE SAD PART

import { ViewChild  } from '@angular/core';
import { DataGridComponent } from './datagrid.component';

// AOT demands a shim around anything in a mixin that affects metadata
// which means you have to know mixin internals (boo hoo)
//
// AOT also demands the `export`
export class DemoMixShim extends demoMix {

    // if anything was injected, would have to shim that too

    @ViewChild(DataGridComponent) dgComponent: DataGridComponent;

    ngOnInit() { super.ngOnInit(); }

    ngOnDestroy() { super.ngOnDestroy(); }

    ngAfterViewInit() { super.ngAfterViewInit(); }
}
////////////////////


@Component({
  selector: 'mix-shim-comp',
  template: `
    <h2>MixedShimComponent {{name}}</h2>
    <p>Foo() says {{foo()}}</p>
    <data-grid></data-grid>
  `
})
// Inherit from shim class instead of mixin
export class MixedShimComponent extends DemoMixShim {
  name = 'Joe Shim';
}
