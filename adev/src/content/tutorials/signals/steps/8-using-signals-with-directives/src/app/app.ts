import {Component, ChangeDetectionStrategy} from '@angular/core';
import {HighlightDirective} from './highlight-directive';

@Component({
  selector: 'app-root',
  imports: [HighlightDirective],
  template: `
    <div>
      <h1>Directive with Signals</h1>

      <div highlight color="blue" intensity="0.2">
        Hover me - Blue highlight
      </div>

      <div highlight color="green" intensity="0.4">
        Hover me - Green highlight
      </div>

      <div highlight color="yellow" intensity="0.6">
        Hover me - Yellow highlight
      </div>
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
