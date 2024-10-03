import {Component, signal, computed} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: `
    <h2>Cookie recipe</h2>

    <label>
      # of cookies:
      <input type="range" min="10" max="100" step="10" [value]="count()" (input)="update($event)" />
      {{ count() }}
    </label>

    <p>Butter: {{ butter() }} cup(s)</p>
    <p>Sugar: {{ sugar() }} cup(s)</p>
    <p>Flour: {{ flour() }} cup(s)</p>
  `,
})
export class CookieRecipe {
  count = signal(10);

  butter = computed(() => this.count() * 0.1);
  sugar = computed(() => this.count() * 0.05);
  flour = computed(() => this.count() * 0.2);

  update(event: Event) {
    const input = event.target as HTMLInputElement;
    this.count.set(parseInt(input.value));
  }
}

bootstrapApplication(CookieRecipe);
