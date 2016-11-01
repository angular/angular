import {NgModule, ModuleWithProviders, Directive, Renderer, ElementRef} from '@angular/core';


/** Selector that matches all elements that may have style collisions with material1. */
export const ELEMENTS_SELECTOR = `
  md-card,
  md-card-actions,
  md-card-content,
  md-card-footer,
  md-card-header,
  md-card-subtitle,
  md-card-title,
  md-card-title-group,
  md-checkbox,
  md-dialog-container,
  md-divider,
  md-grid-list,
  md-grid-tile,
  md-grid-tile-footer,
  md-grid-tile-header,
  md-hint,
  md-icon,
  md-ink-bar,
  md-input,
  md-list,
  md-list-item,
  md-menu,
  md-nav-list,
  md-option,
  md-placeholder,
  md-progress-bar,
  md-progress-circle,
  md-radio-button,
  md-radio-group,
  md-select,
  md-sidenav,
  md-slider,
  md-spinner,
  md-tab,
  md-toolbar
`;

/**
 * Directive to apply to all material2 components that use the same element name as a
 * component in material2. It does two things:
 * 1) Adds the css class "md2" to the host element so that material1 can use this class with a
 *    :not() in order to avoid affecting material2 elements.
 * 2) Adds a css class to the element that is identical to the element's tag. E.g., the element
 *    `<md-card>` would be given a css class `md-card`. This is done so that material2 can style
 *    only these classes instead of defining element rules that would affect material1 components.
 */
@Directive({
  selector: ELEMENTS_SELECTOR,
})
export class StyleCompatibility {
  constructor(renderer: Renderer, elementRef: ElementRef) {
    const element = elementRef.nativeElement as Node;
    renderer.setElementClass(element, 'md2', true);
    renderer.setElementClass(element, element.nodeName.toLowerCase(), true);
  }
}


@NgModule({
  declarations: [StyleCompatibility],
  exports: [StyleCompatibility],
})
export class StyleCompatibilityModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: StyleCompatibilityModule,
      providers: [],
    };
  }
}
