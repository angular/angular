import {
  Component,
  DestroyRef,
  inject,
  input,
  signal,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'cart-summary',
  template: `
    <div class="cart-summary" [style.background]="isAnimating() ? '#e8f5e8' : ''">
      <h3>Cart Summary {{ isAnimating() ? '🎉' : '' }}</h3>
      <p>Items: {{ itemCount() }}</p>
      <p>Total: \${{ total() }}</p>
      @if (isAnimating()) {
        <p style="color: green; font-weight: bold;">Processing checkout...</p>
      }
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSummary implements OnDestroy {
  itemCount = input.required<number>();
  total = input.required<number>();

  isAnimating = signal(false);

  private timeoutId?: ReturnType<typeof setTimeout>;
  private destroyRef = inject(DestroyRef);

  // Public method for parent interaction
  initiateCheckout() {
    this.isAnimating.set(true);
    const timeoutId = setTimeout(() => this.isAnimating.set(false), 2000);
    this.destroyRef.onDestroy(() => clearTimeout(this.timeoutId));
  }
}
