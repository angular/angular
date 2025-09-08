import {Component, ChangeDetectionStrategy} from '@angular/core';

// TODO: Import inject from @angular/core
// TODO: Import CartStore from './cart-store'
// TODO: Import CartDisplay from './cart-display'

@Component({
  selector: 'app-root',
  // TODO: Add CartDisplay to imports array
  template: `
    <div class="shopping-app">
      <header>
        <h1>Signals with Services Demo</h1>
        <div class="cart-badge">
          Cart: Loading... items ($Loading...)
        </div>
      </header>
      
      <main>
        <!-- TODO: Add cart-display component here -->
      </main>
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // TODO: Inject CartStore using inject(CartStore)
}
