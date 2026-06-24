/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {
  asNativeElements,
  Component,
  ContentChildren,
  Directive,
  forwardRef,
  Inject,
  NgModule,
  NO_ERRORS_SCHEMA,
  QueryList,
} from '../src/core';
import {TestBed} from '../testing';
import {expect} from '@angular/private/testing/matchers';

class Frame {
  name: string = 'frame';
}

class ModuleFrame {
  name: string = 'moduleFram';
}

describe('forwardRef integration', function () {
  beforeEach(() => {
    TestBed.configureTestingModule({imports: [Module], declarations: [App]});
  });

  it('should instantiate components which are declared using forwardRef', () => {
    const a = TestBed.configureTestingModule({schemas: [NO_ERRORS_SCHEMA]}).createComponent(App);
    a.detectChanges();
    expect(asNativeElements(a.debugElement.children)).toHaveText('frame(lock)');
    expect(TestBed.inject(ModuleFrame)).toBeDefined();
  });
});

@NgModule({
  imports: [CommonModule],
  providers: [forwardRef(() => ModuleFrame)],
  declarations: [forwardRef(() => Door), forwardRef(() => Lock)],
  exports: [forwardRef(() => Door), forwardRef(() => Lock)],
})
class Module {}

@Component({
  selector: 'app',
  viewProviders: [forwardRef(() => Frame)],
  template: `<door><lock></lock></door>`,
  standalone: false,
})
class App {}

@Component({
  selector: 'door',
  template: `{{frame.name}}(<span *ngFor="let lock of locks">{{lock.name}}</span>)`,
  standalone: false,
})
class Door {
  @ContentChildren(forwardRef(() => Lock)) locks!: QueryList<Lock>;
  frame: Frame;

  constructor(@Inject(forwardRef(() => Frame)) frame: Frame) {
    this.frame = frame;
  }
}

@Directive({
  selector: 'lock',
  standalone: false,
})
class Lock {
  name: string = 'lock';
}
