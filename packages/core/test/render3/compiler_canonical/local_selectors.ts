/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, NgModule, Pipe, PipeTransform, Type} from '../../../src/core';
import * as $r3$ from '../../../src/core_render3_private_export';
import {ComponentDef, DirectiveDef} from '../../../src/render3';
import {PipeDef} from '../../../src/render3/interfaces/definition';

type $boolean$ = boolean;
type $TRUST_TYPE$ = any;
type $MyComponent$ = MyComponent;
type $MyApp$ = MyApp;

/**
 * This spec demonstrates how components can respect locality in a backwards compatible way which
 * does not break tree shaking.
 *
 * Locality is an important goal to the compiler because it allows the compiler to translate each of
 * the Angular types (`@Component`, `@Directive`, `@Pipe`, `@NgModule`) in a way which does not
 * require any information outside of what is directly available in the decorator. This allows
 * source to be compiled in an independent way. The consequence of this is simple compiler mental
 * model, fast compiles, and publishing compiled code to NPM.
 *
 * Tree shaking is important because we want to ensure that only symbols which are directly needed
 * by the components are retained.
 *
 * The proposal solves two problems:
 * 1. How to compile `@Component` without knowing what other components, directives or pipes are
 *    active.
 * 2. Produce output which is tree shakable.
 *
 * Goal 1 is achieved by compiling `@Component` templates as if there were no other components,
 * directives or pipes present. The resulting `ComponentDef` object then allows 'patching' of
 * component, directives, and pipes at a later point in time (before the first render). On first
 * render the Ivy render engine resolves the component, directives, and pipes. Subsequent renders
 * are fast since the resolution has happened. The "patching" process is achieved by the
 * `@NgModule`'s `defineNgModule` function. While this allows the code to run without any further
 * tool chain, it breaks tree shaking.
 *
 * Goal 2 is achieved by allowing build-optimizer to rearrange the `defineNgModule` calls such
 * that the information is moved to the specific components and the `defineNgModule` is removed.
 * This transformation allows the subsequent build tools to remove any unreferenced symbols.
 *
 * The moving of definitions from `defineNgModule` to `defineComponent` needs to be done in a way
 * which takes selectors into account. (Just because `@NgModule` declares component `Foo` does not
 * mean that it is used in an application. Blindly applying `Foo` to all components would retain
 * it even if no one used it.) For this reason the generated code contains pragmas for the
 * build-optimizer which tell it how the code should be rearranged in tree-shakable way. The
 * important thing to realize is that the rearranging has no semantic impact, it is purely an
 * optimization operation to allow tree-shaker to do its job.
 *
 * When the build-optimizer looks to redistribute component, directive, and pipe references, it
 * needs to know if the destination needs it. To do that build-optimizer needs to be able to
 * compare pipe names as well as execute selectors to see if any of the directives match a
 * destination. For this reason the generated code has pragmas in comments which communicate
 * what pipe names are needed and which elements and attributes are in template to see if
 * any of the potential directives match it. The pipe or directive is only added if the
 * build-optimizer can determine that there has been a match.
 */

/**
 * build-optimizer pragmas description
 *
 * `@__NG_DECLARE_PIPE__` followed by pipe name.
 *
 * Communicates that pipe declaration of a give name follows.
 *
 *
 * `@__NG_DECLARE_DIRECTIVE__` (`@@__NG_DECLARE_COMPONENT__`) followed by parsed selector.
 *
 * Communicates that a directive (or component) declaration with a given selector follows.
 *
 * The selector format is `[elementName, attr1, value1, attr2, value2, ...]` This format
 * matches that of queries.
 *
 * `@__NG_PIPE_TARGETS__` followed by an array of pipe names.
 *
 * Communicates that following list of pipes names are needed by this component. When
 * build-optimizer is trying to determine if a candidate pipe should be added to this component
 * it checks if the pipe name of the candidate pipe is in the `@__NG_PIPE_TARGETS__` list and the
 * candidate is only added if match has been determined.
 *
 *
 * `@__NG_DIRECTIVE_SELECTOR_TARGETS__` followed by an array of array of targets.
 *
 * Communicates a parsed version of all of the element and attributes present in the component's
 * view. The build-optimizer can use this information to determine if a given directive (or
 * component) selector matches this list. If match is determined that the candidate directive is
 * added to this component definition.
 *
 * The format of array of array of targets is:
 * ```
 * [
 *   [ elementName1, attr1_1, value1_1, attr1_2, attr1_2, ...],
 *   [ elementName2, attr2_1, value2_1, attr2_2, attr2_2, ...],
 *   ...
 * ]
 * ```
 *
 *
 * `@__NG_MODULE_DECLARATIONS__`
 *
 * Communicates that `@NgModule` definition follows. The job of the build-optimizer is to remove
 * all instances of `@__NG_MODULE_DECLARATIONS__` by inlining the corresponding component, directive
 * and pipe references into the concrete components which need the information. For inline process
 * to be tree-shakable it must take usage of the destination component into account. (Does the
 * component uses a particular component, directive or pipe).
 */

@Pipe({name: 'noop'})
class MyPipe implements PipeTransform {
  transform(value: any, ...args: any[]) { return value; }
  // NORMATIVE
  /**
   * @__NG_DECLARE_PIPE__: 'noop'
   */
  static ngPipeDef = $r3$.ɵdefinePipe({
    name: 'noop',
    type: MyPipe,
    factory: function MyPipe_Factory() { return new MyPipe(); },
  });
  // /NORMATIVE
}

@Directive({selector: '[foo]'})
class FooDirective {
  // NORMATIVE
  /**
   * @__NG_DECLARE_DIRECTIVE__: ['', foo']
   */
  static ngDirectiveDef = $r3$.ɵdefineDirective({
    type: FooDirective,
    factory: function FooDirective_Factory() { return new FooDirective(); },
  });
  // /NORMATIVE
}

@Directive({selector: '[unused]'})
class UnusedDirective {
  // NORMATIVE
  /**
   * @__NG_DECLARE_DIRECTIVE__: ['', 'unused']
   */
  static ngDirectiveDef = $r3$.ɵdefineDirective({
    type: UnusedDirective,
    factory: function UnusedDirective_Factory() { return new UnusedDirective(); },
  });
  // /NORMATIVE
}

@Component({
  selector: 'my-comp',
  template: `<div foo>{{name|noop}}</div>`,
})
class MyComponent {
  name = 'world';
  // NORMATIVE
  /**
   * @__NG_DECLARE_DIRECTIVE__: ['my-comp']
   * @__NG_DIRECTIVE_SELECTOR_TARGETS__: [ ['div', 'foo', ''] ]
   * @__NG_PIPE_TARGETS__: [ 'noop' ]
   */
  static ngComponentDef = $r3$.ɵdefineComponent({
    type: MyComponent,
    tag: 'my-cmp',
    /**
     * NON-NORMATIVE COMMENT Demonstrates what build-optimizer will add.
     *
     * In this case `MyComponent` is part of `MyLibModule` which has
     * `declarations: [MyComponent, MyPipe, UnusedDirective, FooDirective]`.
     *
     * - `MyComponent` - does not get inlined because its selector does not match
     *   `@__NG_DIRECTIVE_SELECTOR_TARGETS__`
     * - `MyPipe` - gets inlined because its name matches a name in the
     *   `@__NG_PIPE_TARGETS__`.
     * - `UnusedDirective` - does not get inline because its selector does not match
     *   `@__NG_DIRECTIVE_SELECTOR_TARGETS__`
     * - `FooDirective` - gets inlined because its selector matches at least one element in
     *   `@__NG_DIRECTIVE_SELECTOR_TARGETS__`.
     *
     * The result is that build-optimizer will add the following two lines into the
     * `defineComponent`.
     * NOTE: the closure is needed since moving references around could refer to a symbol before it
     * is
     * initialized.
     */
    // directiveDefs: () => [FooDirective],
    // pipeDefs: () => [MyPipe],
    factory: function MyComponent_Factory() { return new MyComponent(); },
    template: function MyComponent_Template(ctx: $MyComponent$, cm: $boolean$) {
      if (cm) {
        $r3$.ɵE(0, 'div', $MyComponent_attrs_0$);
        $r3$.ɵT(1);
        $r3$.ɵe();
        $r3$.ɵPp(2, 'noop' as $TRUST_TYPE$);
      }
      $r3$.ɵt(1, $r3$.ɵb($r3$.ɵpb1(2, ctx.name)));
    }
  });
  // /NORMATIVE
}
// NORMATIVE
const $MyComponent_attrs_0$ = ['foo', ''];
// /NORMATIVE


@Component({
  selector: 'my-app',
  template: `<my-comp></my-comp>`,
})
class MyApp {
  // NORMATIVE
  /**
   * @__NG_DECLARE_DIRECTIVE__: ['my-app']
   * @__NG_DIRECTIVE_SELECTOR_TARGETS__: [ ['my-comp'] ]
   */
  static ngComponentDef = $r3$.ɵdefineComponent({
    type: MyApp,
    tag: 'my-app',
    /**
     * NON-NORMATIVE COMMENT Demonstrates what build-optimizer will add.
     *
     * In this case `MyApp` is part of `MyAppModule` which has `declarations: [MyApp]` and
     * `imports: [MyLibModule]` which in turn only `exports: [MyComponent]`.
     *
     * - `MyApp` - does not get inlined because its selector does not match
     *   `@__NG_DIRECTIVE_SELECTOR_TARGETS__`
     * - `MyComponent` - gets inlined because its selector matches at least one element in
     *   `@__NG_DIRECTIVE_SELECTOR_TARGETS__`.
     *
     * The result is that build-optimizer will add the following line into the `defineComponent`.
     *
     * NOTE: the closure is need since moving references around could refer to a symbol before it is
     * initialized.
     */
    // directiveDefs: () => [MyComponent],
    factory: function MyComponent_Factory() { return new MyComponent(); },
    template: function MyComponent_Template(ctx: $MyComponent$, cm: boolean) {
      if (cm) {
        $r3$.ɵE(0, 'my-comp');
        $r3$.ɵe();
      }
    }
  });
  // /NORMATIVE
}

@NgModule(
    {declarations: [MyComponent, MyPipe, UnusedDirective, FooDirective], exports: [MyComponent]})
class MyLibModule {
  // NORMATIVE
  static ngInjectorDef = $r3$.ɵdefineInjector({
    factory: function MyLibModule_Factory() { return new MyLibModule(); },
    providers: [],
  });
  // /NORMATIVE

  /**
   * NON-NORMATIVE COMMENT Demonstrates what build-optimizer will add.
   *
   * The next NORMATIVE section would be removed after build-optimizer inlines the references.
   * Removal of this section is what enables the tree-shaking.
   */
  // NORMATIVE
  /**
   * @__NG_MODULE_DECLARATIONS__
   */
  static ngModuleDef = defineNgModule({
    declarations: [MyComponent, MyPipe, UnusedDirective, FooDirective],
    exports: [MyComponent],
  });
  // /NORMATIVE
}

@NgModule({declarations: [MyApp], imports: [MyLibModule]})
class MyAppModule {
  // NORMATIVE
  static ngInjectorDef = $r3$.ɵdefineInjector({
    imports: [MyLibModule],
    factory: function MyAppModule_Factory() { return new MyAppModule(); },
    providers: [],
  });
  // /NORMATIVE

  /**
   * NON-NORMATIVE COMMENT Demonstrates what build-optimizer will add.
   *
   * The next NORMATIVE section would be removed after build-optimizer inlines the references.
   * Removal of this section is what enables the tree-shaking.
   */
  // NORMATIVE
  /**
   * @__NG_MODULE_DECLARATIONS__
   */
  static ngModuleDef = defineNgModule({
    declarations: [MyApp],
    imports: [MyLibModule],
  });
  // /NORMATIVE
}

function main_toPreventBootstrapInTest() {
  // Boot refers to MyAppModule, which ensures that MyAppModule will have a chance to patch the
  // components.
  $r3$.ɵrenderComponent(MyApp, {injector: $r3$.ɵcreateInjector(MyAppModule)});
}

////////////////////////////////////////////
// TODO: move to `src` folder
////////////////////////////////////////////

interface NgModuleType<T> extends Type<T> {
  ngModuleDef: NgModuleDef;
}
interface NgModuleDef {
  patchImports: (destination: Type<any>) => void;
}

/**
 * Creates selector map definition object.
 *
 * `NgModule` through `declarations`, `imports` and `exports` can determine which component,
 * directive and pipes can be used in which component templates. Selector map definition
 * provides that runtime information. The information is formatted in such a way so that global
 * optimizer can rearrange the references so that the code becomes available for tree-shaking.
 *
 * @param declarations same as `@NgModule.declarations`
 * @param imports same as `@Ngmodule.imports`
 * @param exports same as `@NgModule.exports`
 */
function defineNgModule({declarations, imports, exports}: {
  declarations?: Type<any>[],
  imports?: Type<any>[],
  exports?: Type<any>[],
}): NgModuleDef {
  if (declarations) {
    // everyone component in the declarations can see every other component.
    declarations.forEach((dst) => {
      declarations.forEach((from) => addDirectiveOrPipe(dst, from));
      if (imports) {
        imports.forEach((imprt: NgModuleType<any>) => { imprt.ngModuleDef.patchImports(dst); });
      }
    });
  }
  return {
    patchImports: (dst: Type<any>) => {
      // When this is being exported, only patch the exports.
      if (exports) {
        exports.forEach((exportType) => addDirectiveOrPipe(dst, exportType));
      }
      if (imports) {
        // Recurse to child exports.
        imports.forEach(
            (importType: NgModuleType<any>) => { importType.ngModuleDef.patchImports(dst); });
      }
    }
  };
}

function addDirectiveOrPipe(destination: Type<any>, directiveOrPipeDependency: Type<any>): void {
  const ngComponentDef: ComponentDef<any> = (destination as any).ngComponentDef;
  if (ngComponentDef) {
    const ngDirectiveDefRef: DirectiveDef<any> =
        (directiveOrPipeDependency as any).ngComponentDef ||
        (directiveOrPipeDependency as any).ngDirectiveDef;
    if (ngDirectiveDefRef) {
      (ngComponentDef.directiveDefs =
           (ngComponentDef.directiveDefs || []) as Array<ComponentDef<any>|DirectiveDef<any>>)
          .push(ngDirectiveDefRef);
    }
    const ngPipeDefRef: PipeDef<any> = (directiveOrPipeDependency as any).ngPipeDef;
    if (ngPipeDefRef) {
      (ngComponentDef.pipeDefs = (ngComponentDef.pipeDefs || []) as Array<PipeDef<any>>)
          .push(ngPipeDefRef);
    }
  }
}
