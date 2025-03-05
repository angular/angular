/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  NgModule,
  ɵɵCopyDefinitionFeature as CopyDefinitionFeature,
  ɵɵdefineComponent as defineComponent,
  ɵɵInheritDefinitionFeature as InheritDefinitionFeature,
} from '../../src/core';
import {TestBed} from '../../testing';

describe('CopyDefinitionFeature', () => {
  it('should copy the template function of a component definition from parent to child', () => {
    // It would be nice if the base component could be JIT compiled. However, this creates
    // a getter for ɵcmp which precludes adding a static definition of that field for the
    // child class.
    // TODO(alxhub): see if there's a cleaner way to do this.
    class BaseComponent {
      name!: string;
      static ɵcmp = defineComponent({
        type: BaseComponent,
        selectors: [['some-cmp']],
        decls: 0,
        vars: 0,
        inputs: {name: 'name'},
        template: function BaseComponent_Template(rf, ctx) {
          ctx.rendered = true;
        },
        encapsulation: 2,
      });
      static ɵfac = function BaseComponent_Factory(t: any) {
        return new (t || BaseComponent)();
      };

      rendered = false;
    }

    class ChildComponent extends BaseComponent {
      static override ɵcmp = defineComponent({
        type: ChildComponent,
        selectors: [['some-cmp']],
        standalone: false,
        features: [InheritDefinitionFeature, CopyDefinitionFeature],
        decls: 0,
        vars: 0,
        template: function ChildComponent_Template(rf, ctx) {},
        encapsulation: 2,
      });
      static override ɵfac = function ChildComponent_Factory(t: any) {
        return new (t || ChildComponent)();
      };
    }

    @NgModule({
      declarations: [ChildComponent],
      exports: [ChildComponent],
    })
    class Module {}

    @Component({
      selector: 'test-cmp',
      template: '<some-cmp name="Success!"></some-cmp>',
      standalone: false,
    })
    class TestCmp {}

    TestBed.configureTestingModule({
      declarations: [TestCmp],
      imports: [Module],
    });

    const fixture = TestBed.createComponent(TestCmp);

    // The child component should have matched and been instantiated.
    const child = fixture.debugElement.children[0].componentInstance as ChildComponent;
    expect(child instanceof ChildComponent).toBe(true);

    // And the base class template function should've been called.
    expect(child.rendered).toBe(true);

    // The input binding should have worked.
    expect(child.name).toBe('Success!');
  });
});
