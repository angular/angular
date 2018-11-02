/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DoCheck, EventEmitter, Input, OnChanges, Output, SimpleChange, SimpleChanges} from '../../src/core';
import {InheritDefinitionFeature} from '../../src/render3/features/inherit_definition_feature';
import {DirectiveDef, NgOnChangesFeature, defineComponent, defineDirective} from '../../src/render3/index';

describe('NgOnChangesFeature', () => {
  it('should patch class', () => {
    class MyDirective implements OnChanges, DoCheck {
      public log: Array<string|SimpleChange> = [];
      public valA: string = 'initValue';
      public set valB(value: string) { this.log.push(value); }

      public get valB() { return 'works'; }

      ngDoCheck(): void { this.log.push('ngDoCheck'); }
      ngOnChanges(changes: SimpleChanges): void {
        this.log.push('ngOnChanges');
        this.log.push('valA', changes['valA']);
        this.log.push('valB', changes['valB']);
      }

      static ngDirectiveDef = defineDirective({
        type: MyDirective,
        selectors: [['', 'myDir', '']],
        factory: () => new MyDirective(),
        features: [NgOnChangesFeature],
        inputs: {valA: 'valA', valB: 'valB'}
      });
    }

    const myDir =
        (MyDirective.ngDirectiveDef as DirectiveDef<MyDirective>).factory(null) as MyDirective;
    myDir.valA = 'first';
    expect(myDir.valA).toEqual('first');
    myDir.valB = 'second';
    expect(myDir.log).toEqual(['second']);
    expect(myDir.valB).toEqual('works');
    myDir.log.length = 0;
    (MyDirective.ngDirectiveDef as DirectiveDef<MyDirective>).doCheck !.call(myDir);
    const changeA = new SimpleChange(undefined, 'first', true);
    const changeB = new SimpleChange(undefined, 'second', true);
    expect(myDir.log).toEqual(['ngOnChanges', 'valA', changeA, 'valB', changeB, 'ngDoCheck']);
  });

  it('should inherit the behavior from super class', () => {
    const log: any[] = [];

    class SuperDirective implements OnChanges, DoCheck {
      valA = 'initValue';

      set valB(value: string) { log.push(value); }

      get valB() { return 'works'; }

      ngDoCheck(): void { log.push('ngDoCheck'); }
      ngOnChanges(changes: SimpleChanges): void {
        log.push('ngOnChanges');
        log.push('valA', changes['valA']);
        log.push('valB', changes['valB']);
        log.push('valC', changes['valC']);
      }

      static ngDirectiveDef = defineDirective({
        type: SuperDirective,
        selectors: [['', 'superDir', '']],
        factory: () => new SuperDirective(),
        features: [NgOnChangesFeature],
        inputs: {valA: 'valA', valB: 'valB'},
      });
    }

    class SubDirective extends SuperDirective {
      valC = 'initValue';

      static ngDirectiveDef = defineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        factory: () => new SubDirective(),
        features: [InheritDefinitionFeature],
        inputs: {valC: 'valC'},
      });
    }

    const myDir =
        (SubDirective.ngDirectiveDef as DirectiveDef<SubDirective>).factory(null) as SubDirective;
    myDir.valA = 'first';
    expect(myDir.valA).toEqual('first');

    myDir.valB = 'second';
    expect(myDir.valB).toEqual('works');

    myDir.valC = 'third';
    expect(myDir.valC).toEqual('third');

    log.length = 0;
    (SubDirective.ngDirectiveDef as DirectiveDef<SubDirective>).doCheck !.call(myDir);
    const changeA = new SimpleChange(undefined, 'first', true);
    const changeB = new SimpleChange(undefined, 'second', true);
    const changeC = new SimpleChange(undefined, 'third', true);

    expect(log).toEqual(
        ['ngOnChanges', 'valA', changeA, 'valB', changeB, 'valC', changeC, 'ngDoCheck']);
  });

  it('should not run the parent doCheck if it is not called explicitly on super class', () => {
    const log: any[] = [];

    class SuperDirective implements OnChanges, DoCheck {
      valA = 'initValue';

      ngDoCheck(): void { log.push('ERROR: Child overrides it without super call'); }
      ngOnChanges(changes: SimpleChanges): void { log.push(changes.valA, changes.valB); }

      static ngDirectiveDef = defineDirective({
        type: SuperDirective,
        selectors: [['', 'superDir', '']],
        factory: () => new SuperDirective(),
        features: [NgOnChangesFeature],
        inputs: {valA: 'valA'},
      });
    }

    class SubDirective extends SuperDirective implements DoCheck {
      valB = 'initValue';

      ngDoCheck(): void { log.push('sub ngDoCheck'); }

      static ngDirectiveDef = defineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        factory: () => new SubDirective(),
        features: [InheritDefinitionFeature],
        inputs: {valB: 'valB'},
      });
    }

    const myDir =
        (SubDirective.ngDirectiveDef as DirectiveDef<SubDirective>).factory(null) as SubDirective;
    myDir.valA = 'first';
    myDir.valB = 'second';

    (SubDirective.ngDirectiveDef as DirectiveDef<SubDirective>).doCheck !.call(myDir);
    const changeA = new SimpleChange(undefined, 'first', true);
    const changeB = new SimpleChange(undefined, 'second', true);
    expect(log).toEqual([changeA, changeB, 'sub ngDoCheck']);
  });

  it('should run the parent doCheck if it is inherited from super class', () => {
    const log: any[] = [];

    class SuperDirective implements OnChanges, DoCheck {
      valA = 'initValue';

      ngDoCheck(): void { log.push('super ngDoCheck'); }
      ngOnChanges(changes: SimpleChanges): void { log.push(changes.valA, changes.valB); }

      static ngDirectiveDef = defineDirective({
        type: SuperDirective,
        selectors: [['', 'superDir', '']],
        factory: () => new SuperDirective(),
        features: [NgOnChangesFeature],
        inputs: {valA: 'valA'},
      });
    }

    class SubDirective extends SuperDirective implements DoCheck {
      valB = 'initValue';

      static ngDirectiveDef = defineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        factory: () => new SubDirective(),
        features: [InheritDefinitionFeature],
        inputs: {valB: 'valB'},
      });
    }

    const myDir =
        (SubDirective.ngDirectiveDef as DirectiveDef<SubDirective>).factory(null) as SubDirective;
    myDir.valA = 'first';
    myDir.valB = 'second';

    (SubDirective.ngDirectiveDef as DirectiveDef<SubDirective>).doCheck !.call(myDir);
    const changeA = new SimpleChange(undefined, 'first', true);
    const changeB = new SimpleChange(undefined, 'second', true);
    expect(log).toEqual([changeA, changeB, 'super ngDoCheck']);
  });

  it('should apply the feature to inherited properties if on sub class', () => {
    const log: any[] = [];

    class SuperDirective {
      valC = 'initValue';

      static ngDirectiveDef = defineDirective({
        type: SuperDirective,
        selectors: [['', 'subDir', '']],
        factory: () => new SuperDirective(),
        features: [],
        inputs: {valC: 'valC'},
      });
    }

    class SubDirective extends SuperDirective implements OnChanges, DoCheck {
      valA = 'initValue';

      set valB(value: string) { log.push(value); }

      get valB() { return 'works'; }

      ngDoCheck(): void { log.push('ngDoCheck'); }
      ngOnChanges(changes: SimpleChanges): void {
        log.push('ngOnChanges');
        log.push('valA', changes['valA']);
        log.push('valB', changes['valB']);
        log.push('valC', changes['valC']);
      }

      static ngDirectiveDef = defineDirective({
        type: SubDirective,
        selectors: [['', 'superDir', '']],
        factory: () => new SubDirective(),
        // Inheritance must always be before OnChanges feature.
        features: [
          InheritDefinitionFeature,
          NgOnChangesFeature,
        ],
        inputs: {valA: 'valA', valB: 'valB'}
      });
    }

    const myDir =
        (SubDirective.ngDirectiveDef as DirectiveDef<SubDirective>).factory(null) as SubDirective;
    myDir.valA = 'first';
    expect(myDir.valA).toEqual('first');

    myDir.valB = 'second';
    expect(log).toEqual(['second']);
    expect(myDir.valB).toEqual('works');

    myDir.valC = 'third';
    expect(myDir.valC).toEqual('third');

    log.length = 0;
    (SubDirective.ngDirectiveDef as DirectiveDef<SubDirective>).doCheck !.call(myDir);
    const changeA = new SimpleChange(undefined, 'first', true);
    const changeB = new SimpleChange(undefined, 'second', true);
    const changeC = new SimpleChange(undefined, 'third', true);
    expect(log).toEqual(
        ['ngOnChanges', 'valA', changeA, 'valB', changeB, 'valC', changeC, 'ngDoCheck']);
  });

  it('correctly computes firstChange', () => {
    class MyDirective implements OnChanges {
      public log: Array<string|SimpleChange|undefined> = [];
      public valA: string = 'initValue';
      // TODO(issue/24571): remove '!'.
      public valB !: string;

      ngOnChanges(changes: SimpleChanges): void {
        this.log.push('valA', changes['valA']);
        this.log.push('valB', changes['valB']);
      }

      static ngDirectiveDef = defineDirective({
        type: MyDirective,
        selectors: [['', 'myDir', '']],
        factory: () => new MyDirective(),
        features: [NgOnChangesFeature],
        inputs: {valA: 'valA', valB: 'valB'}
      });
    }

    const myDir =
        (MyDirective.ngDirectiveDef as DirectiveDef<MyDirective>).factory(null) as MyDirective;
    myDir.valA = 'first';
    myDir.valB = 'second';
    (MyDirective.ngDirectiveDef as DirectiveDef<MyDirective>).doCheck !.call(myDir);
    const changeA1 = new SimpleChange(undefined, 'first', true);
    const changeB1 = new SimpleChange(undefined, 'second', true);
    expect(myDir.log).toEqual(['valA', changeA1, 'valB', changeB1]);

    myDir.log.length = 0;
    myDir.valA = 'third';
    (MyDirective.ngDirectiveDef as DirectiveDef<MyDirective>).doCheck !.call(myDir);
    const changeA2 = new SimpleChange('first', 'third', false);
    expect(myDir.log).toEqual(['valA', changeA2, 'valB', undefined]);
  });

  it('should not create a getter when only a setter is originally defined', () => {
    class MyDirective implements OnChanges {
      public log: Array<string|SimpleChange> = [];

      public set onlySetter(value: string) { this.log.push(value); }

      ngOnChanges(changes: SimpleChanges): void {
        this.log.push('ngOnChanges');
        this.log.push('onlySetter', changes['onlySetter']);
      }

      static ngDirectiveDef = defineDirective({
        type: MyDirective,
        selectors: [['', 'myDir', '']],
        factory: () => new MyDirective(),
        features: [NgOnChangesFeature],
        inputs: {onlySetter: 'onlySetter'}
      });
    }

    const myDir =
        (MyDirective.ngDirectiveDef as DirectiveDef<MyDirective>).factory(null) as MyDirective;
    myDir.onlySetter = 'someValue';
    expect(myDir.onlySetter).toBeUndefined();
    (MyDirective.ngDirectiveDef as DirectiveDef<MyDirective>).doCheck !.call(myDir);
    const changeSetter = new SimpleChange(undefined, 'someValue', true);
    expect(myDir.log).toEqual(['someValue', 'ngOnChanges', 'onlySetter', changeSetter]);
  });
});
