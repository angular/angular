/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {ChangeDetectorRef, Component, Pipe, PipeTransform} from '@angular/core';
import {ViewRef} from '@angular/core/src/render3/view_ref';
import {TestBed} from '@angular/core/testing';

describe('di', () => {
  describe('ChangeDetectorRef', () => {
    it('should inject host component ChangeDetectorRef into directives on templates', () => {
      let pipeInstance: MyPipe;

      @Pipe({name: 'pipe'})
      class MyPipe implements PipeTransform {
        constructor(public cdr: ChangeDetectorRef) { pipeInstance = this; }

        transform(value: any): any { return value; }
      }

      @Component({
        selector: 'my-app',
        template: `<div *ngIf="showing | pipe">Visible</div>`,
      })
      class MyApp {
        showing = true;

        constructor(public cdr: ChangeDetectorRef) {}
      }

      TestBed.configureTestingModule({declarations: [MyApp, MyPipe], imports: [CommonModule]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();
      expect((pipeInstance !.cdr as ViewRef<MyApp>).context).toBe(fixture.componentInstance);
    });
  });
});
