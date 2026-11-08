
import { Component, Directive } from '@angular/core';

@Directive({selector: '[ngIf]'})
export class FakeNgIf {}

@Component({
    imports: [FakeNgIf],
    selector: 'simple', template: '<ng-content *ngIf="showContent"></ng-content>',
})
export class SimpleComponent {
    showContent = true
}
