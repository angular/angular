import { Component } from "@angular/core";

export function trigger(name: string) {
  return { name };
}

@Component({
  selector: "animation-case",
  template: `
    <div
      [animate-~{animate-prefix}]
      (@openClose~{trigger}.done)="onAnimationEvent($event)"
      (@openClose.~{event})="onAnimationEvent($event)"
    ></div>
  `,
  animations: [trigger("openClose")]
})
export class AnimationsCaseComponent {}
