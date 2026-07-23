import {Directive, effect, input, TemplateRef, ViewContainerRef} from '@angular/core';

import {Loaded, LoadingState} from './loading-state';

@Directive({
  selector: '[appIfLoaded]',
})
export class IfLoadedDirective<T> {
  private isViewCreated = false;

  state = input.required<LoadingState<T>>({alias: 'appIfLoaded'});

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    private readonly templateRef: TemplateRef<unknown>,
  ) {
    effect(() => {
      if (!this.isViewCreated && this.state().type === 'loaded') {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
        this.isViewCreated = true;
      } else if (this.isViewCreated && this.state().type !== 'loaded') {
        this.viewContainerRef.clear();
        this.isViewCreated = false;
      }
    });
  }

  static ngTemplateGuard_appIfLoaded<T>(
    dir: IfLoadedDirective<T>,
    state: LoadingState<T>,
  ): state is Loaded<T> {
    return true;
  }
}
