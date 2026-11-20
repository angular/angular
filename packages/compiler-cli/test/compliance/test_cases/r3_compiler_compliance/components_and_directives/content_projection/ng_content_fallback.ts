import { Component, Directive } from '@angular/core';

@Directive({selector: '[ngIf]'})
export class FakeNgIf {}
@Component({
  selector: 'test',
  imports: [FakeNgIf],
  template: `
    <ng-content select="basic">Basic fallback</ng-content>

    <div>
      <ng-content>
        <h1>This is {{type}} <strong>content</strong>!</h1>
      </ng-content>
    </div>

    @if (hasFooter) {
      <ng-content select="footer">
        Inside control flow
      </ng-content>
    }

    <ng-content select="structural" *ngIf="hasStructural">
      <h2>With a structural directive</h2>
    </ng-content>
  `
})
export class TestComponent {
  type = 'complex';
  hasFooter = false;
  hasStructural = false;
}
