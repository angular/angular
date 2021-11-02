import { Component, Input } from '@angular/core';

// #docregion example
@Component({
  selector: 'toh-hero',
  template: `...`
})
export class HeroComponent {
  // The exclamation mark suppresses errors that a property is
  // not initialized.
  // Ignoring this enforcement can prevent the type checker
  // from finding potential issues.
  @Input() id!: string;
}
// #enddocregion example
