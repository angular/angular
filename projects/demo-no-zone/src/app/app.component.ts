import { Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  counter = 0;

  constructor(private _cd: ChangeDetectorRef) {
    console.log((window as any).ng);
  }

  increment(): void {
    this.counter++;
    this._cd.detectChanges();
  }
}
