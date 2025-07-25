import {Component, inject} from '@angular/core';
import {CartService} from './cart-service';
import {CartDisplay} from './cart-display';

@Component({
  selector: 'app-root',
  imports: [CartDisplay],
  template: `
    <div class="shopping-app">
      <header>
        <h1>Signals with Services Demo</h1>
        <div class="cart-badge">
          Cart: {{ cartService.totalQuantity() }} items (\${{ cartService.totalPrice() }})
        </div>
      </header>
      
      <main>
        <cart-display></cart-display>
      </main>
    </div>
  `,
  styleUrls: ['./app.css'],
})
export class App {
  cartService = inject(CartService);
}
