/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgtscTestEnvironment} from './env';

function setupCommon(env: NgtscTestEnvironment): void {
  env.write('node_modules/@angular/common/index.d.ts', `
import * as i0 from '@angular/core';

export declare class NgForOfContext<T> {
  $implicit: T;
  ngForOf: T[];
  index: number;
  count: number;
  readonly first: boolean;
  readonly last: boolean;
  readonly even: boolean;
  readonly odd: boolean;
}

export declare class NgForOf<T> {
  ngForOf: T[];
  static ngTemplateContextGuard<T>(dir: NgForOf<T>, ctx: any): ctx is NgForOfContext<T>;
  static ngDirectiveDef: i0.ɵDirectiveDefWithMeta<NgForOf<any>, '[ngFor][ngForOf]', never, {'ngForOf': 'ngForOf'}, {}, never>;
}

export declare class NgIf {
  ngIf: any;
  static ngTemplateGuard_ngIf<E>(dir: NgIf, expr: E): expr is NonNullable<E>
  static ngDirectiveDef: i0.ɵDirectiveDefWithMeta<NgForOf<any>, '[ngIf]', never, {'ngIf': 'ngIf'}, {}, never>;
}

export declare class CommonModule {
  static ngModuleDef: i0.ɵNgModuleDefWithMeta<CommonModule, [typeof NgIf, typeof NgForOf], never, [typeof NgIf, typeof NgForOf]>;
}
`);
}

describe('ngtsc type checking', () => {
  if (!NgtscTestEnvironment.supported) {
    // These tests should be excluded from the non-Bazel build.
    return;
  }

  let env !: NgtscTestEnvironment;

  beforeEach(() => {
    env = NgtscTestEnvironment.setup();
    env.tsconfig({fullTemplateTypeCheck: true});
    setupCommon(env);
  });

  it('should check a simple component', () => {
    env.write('test.ts', `
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: 'I am a simple template with no type info',
    })
    class TestCmp {}

    @NgModule({
      declarations: [TestCmp],
    })
    class Module {}
    `);

    env.driveMain();
  });

  it('should check basic usage of NgIf', () => {
    env.write('test.ts', `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngIf="user">{{user.name}}</div>',
    })
    class TestCmp {
      user: {name: string}|null;
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    class Module {}
    `);

    env.driveMain();
  });

  it('should check basic usage of NgFor', () => {
    env.write('test.ts', `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngFor="let user of users">{{user.name}}</div>',
    })
    class TestCmp {
      users: {name: string}[];
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    class Module {}
    `);

    env.driveMain();
  });

  it('should report an error inside the NgFor template', () => {
    env.write('test.ts', `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngFor="let user of users">{{user.does_not_exist}}</div>',
    })
    class TestCmp {
      users: {name: string}[];
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    class Module {}
    `);

    const diags = env.driveDiagnostics();
    expect(diags.length).toBe(1);
    expect(diags[0].messageText).toContain('does_not_exist');
  });

  it('should constrain types using type parameter bounds', () => {
    env.write('test.ts', `
    import {CommonModule} from '@angular/common';
    import {Component, Input, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngFor="let user of users">{{user.does_not_exist}}</div>',
    })
    class TestCmp<T extends {name: string}> {
      @Input() users: T[];
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    class Module {}
    `);

    const diags = env.driveDiagnostics();
    expect(diags.length).toBe(1);
    expect(diags[0].messageText).toContain('does_not_exist');
  });
});
