// based on https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html

import { OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { DataGridComponent } from './datagrid.component';

//////  Mixin helper type

type Constructor<T> = new(...args: any[]) => T;

//////// fooMixin

export function fooMixin<T extends Constructor<{}>>(Base: T) {
  return class extends Base {
    foo() { return 'Foo'; }
  };
}

///////// lcHookMixin

export function lcHookMixin<T extends Constructor<{name?: string}>>(Base: T) {

  return class extends Base implements OnInit, OnDestroy {

    private named() { return this.name || 'unnamed'; }

    ngOnInit() {
      console.log('initializing component for ' + this.named());
    }

    ngOnDestroy() {
      console.log('destroying component for ' + this.named());
    }

  };
}

///////////// dgMixin

// Gets the DataGrid from the outer component.
// Leave it to the DgMixin to do something with it
export class DgMixinBase {
  @ViewChild(DataGridComponent) dgComponent: DataGridComponent;
}

export function dgMixin<T extends Constructor<DgMixinBase>>(Base: T) {

  return class extends Base implements AfterViewInit {

    // Could have some really interesting datagrid logic here
    private doItWithDg() {
      const id = this.dgComponent ? this.dgComponent.id : 'unknown';
      console.log('The datagrid id is ' + id);
    }

    // Won't have access to datagrid until this hook
    ngAfterViewInit() { this.doItWithDg(); }

  };

}

// The default mixin uses the DgMixinBase directly
export const dgMixinDefault = dgMixin(DgMixinBase);

