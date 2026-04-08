import {Component, inject, ApplicationRef} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'hydration';
  onClick = () => {
    document.querySelector('#divElement')!.textContent = 'click triggered.';
  };
  constructor() {
    const appRef = inject(ApplicationRef);
    if (typeof window !== 'undefined') {
      (window as unknown as {hydrationCompleteSignal: () => boolean}).hydrationCompleteSignal =
        appRef.isHydrationComplete;
    }
  }
}
