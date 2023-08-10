import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-currency-formatting',
  templateUrl: './currency-formatting.component.html',
  imports: [CurrencyPipe],
})
export class CurrencyFormattingComponent {
  amount = 42.50;
}
