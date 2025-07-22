import {Component} from '@angular/core';

// TODO: Import inject from @angular/core
// TODO: Import CartService from './cart-service'
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
  styleUrls: ['./app.css'],
})
export class App {
  // TODO: Inject CartService using inject(CartService)
}
