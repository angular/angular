import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

import { Loaded, LoadingState } from './loading-state';

@Directive({ selector: '[appIfLoaded]' })
export class IfLoadedDirective<T> {
  private isViewCreated = false;

  @Input('appIfLoaded') set state(state: LoadingState<T>) {
    if (!this.isViewCreated && state.type === 'loaded') {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
      this.isViewCreated = true;
    } else if (this.isViewCreated && state.type !== 'loaded') {
      this.viewContainerRef.clear();
      this.isViewCreated = false;
    }
  }

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    private readonly templateRef: TemplateRef<unknown>
  ) {}

  static ngTemplateGuard_appIfLoaded<T>(
    dir: IfLoadedDirective<T>,
    state: LoadingState<T>
  ): state is Loaded<T> {
    return true;
  }
}
