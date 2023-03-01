import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({ selector: '[appTrigonometry]' })
export class TrigonometryDirective {
  private isViewCreated = false;
  private readonly context = new TrigonometryContext();

  @Input('appTrigonometry') set angle(angleInDegrees: number) {
    const angleInRadians = toRadians(angleInDegrees);
    this.context.sin = Math.sin(angleInRadians);
    this.context.cos = Math.cos(angleInRadians);
    this.context.tan = Math.tan(angleInRadians);

    if (!this.isViewCreated) {
      this.viewContainerRef.createEmbeddedView(this.templateRef, this.context);
      this.isViewCreated = true;
    }
  }

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    private readonly templateRef: TemplateRef<TrigonometryContext>
  ) {}

  // Make sure the template checker knows the type of the context with which the
  // template of this directive will be rendered
  static ngTemplateContextGuard(
    directive: TrigonometryDirective,
    context: unknown
  ): context is TrigonometryContext {
    return true;
  }
}

class TrigonometryContext {
  sin = 0;
  cos = 0;
  tan = 0;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
