import {CONST} from 'angular2/src/facade/lang';
import {DependencyAnnotation} from 'angular2/di';

/**
 * The directive can only be injected from the parent element.
 * 
 * ## Example
 * 
 * ```
 * <div dependency="1">
 *   <div dependency="2" my-directive></div>
 * </div>
 * ```
 * 
 * ```
 * @Decorator({
 *   selector: '[dependency]',
 *   bind: {
 *     'id':'dependency'
 *   }
 * })
 * class Dependency {
 *   id:string;
 * }
 * 
 * 
 * @Decorator({
 *   selector: '[my-directive]'
 * })
 * class Dependency {
 *   constructor(@Parent() dependency:Dependency) {
 *     expect(dependency.id).toEqual(1);
 *   };
 * }
 * ```
 * 
 * In the above example the `@Parent()` annotation forces the injector to retrieve the dependency from the
 * parent element (even thought the current element could resolve it).
 *
 * @publicModule angular2/annotations
 */
export class Parent extends DependencyAnnotation {
  @CONST()
  constructor() {
    super();
  }
}

/**
 * The directive can only be injected from the ancestor (any element between parent element and shadow root).
 *
 * 
 * ## Example
 * 
 * ```
 * <div dependency="1">
 *   <div dependency="2">
 *     <div>
 *       <div dependency="3" my-directive></div>
 *     </div>
 *   </div>
 * </div>
 * ```
 * 
 * ```
 * @Decorator({
 *   selector: '[dependency]',
 *   bind: {
 *     'id':'dependency'
 *   }
 * })
 * class Dependency {
 *   id:string;
 * }
 * 
 * 
 * @Decorator({
 *   selector: '[my-directive]'
 * })
 * class Dependency {
 *   constructor(@Ancestor() dependency:Dependency) {
 *     expect(dependency.id).toEqual(2);
 *   };
 * }
 * ```
 * 
 * In the above example the `@Ancestor()` annotation forces the injector to retrieve the dependency from the
 * first ancestor. 
 * - The current element `dependency="3"` is skipped
 * - Next parent has no directives `<div>`
 * - Next parent has the `Dependency` directive and so the dependency is satisfied.
 *
 * @publicModule angular2/annotations
 */
export class Ancestor extends DependencyAnnotation {
  @CONST()
  constructor() {
    super();
  }
}
