// #docregion
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sizer',
  template: `
  <div>
    <button type="button" (click)="dec()" title="smaller">-</button>
    <button type="button" (click)="inc()" title="bigger">+</button>
    <span [style.font-size.px]="size">FontSize: {{size}}px</span>
  </div>`
})
export class SizerComponent {
  @Input()  size!: number | string;
  @Output() sizeChange = new EventEmitter<number>();

  dec() { this.resize(-1); }
  inc() { this.resize(+1); }

  resize(delta: number) {
    this.size = Math.min(40, Math.max(8, +this.size + delta));
    this.sizeChange.emit(this.size);
  }
}
