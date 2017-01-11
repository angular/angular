import {Injectable, Directive, ModuleWithProviders, NgModule, ElementRef} from '@angular/core';


// "Polyfill" for `Node.replaceWith()`.
// cf. https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/replaceWith
function _replaceWith(toReplaceEl: HTMLElement, otherEl: HTMLElement) {
  toReplaceEl.parentElement.replaceChild(otherEl, toReplaceEl);
}

/** @docs-private */
@Directive({
  selector: 'cdk-dom-projection-host'
})
export class DomProjectionHost {
  constructor(public ref: ElementRef) {}
}


/** @docs-private */
@Injectable()
export class DomProjection {
  /**
   * Project an element into a host element.
   * Replace a host element by another element. This also replaces the children of the element
   * by the children of the host.
   *
   * It should be used like this:
   *
   * ```
   *   @Component({
   *     template: `<div>
   *       <cdk-dom-projection-host>
   *         <div>other</div>
   *         <ng-content></ng-content>
   *       </cdk-dom-projection-host>
   *     </div>`
   *   })
   *   class Cmpt {
   *     constructor(private _projector: DomProjection, private _el: ElementRef) {}
   *     ngOnInit() { this._projector.project(this._el, this._projector); }
   *   }
   * ```
   *
   * This component will move the content of the element it's applied to in the outer div. Because
   * `project()` also move the children of the host inside the projected element, the element will
   * contain the `<div>other</div>` HTML as well as its own children.
   *
   * Note: without `<ng-content></ng-content>` the projection will project an empty element.
   *
   * @param ref ElementRef to be projected.
   * @param host Projection host into which to project the `ElementRef`.
   */
  project(ref: ElementRef, host: DomProjectionHost): void {
    const projectedEl = ref.nativeElement;
    const hostEl = host.ref.nativeElement;
    const childNodes = projectedEl.childNodes;
    let child = childNodes[0];

    // We hoist all of the projected element's children out into the projected elements position
    // because we *only* want to move the projected element and not its children.
    _replaceWith(projectedEl, child);
    let l = childNodes.length;
    while (l--) {
      child.parentNode.insertBefore(childNodes[0], child.nextSibling);
      child = child.nextSibling;  // nextSibling is now the childNodes[0].
    }

    // Insert all host children under the projectedEl, then replace host by component.
    l = hostEl.childNodes.length;
    while (l--) {
      projectedEl.appendChild(hostEl.childNodes[0]);
    }
    _replaceWith(hostEl, projectedEl);

    // At this point the host is replaced by the component. Nothing else to be done.
  }
}


/** @docs-private */
@NgModule({
  exports: [DomProjectionHost],
  declarations: [DomProjectionHost],
  providers: [DomProjection],
})
export class ProjectionModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ProjectionModule,
    };
  }
}
