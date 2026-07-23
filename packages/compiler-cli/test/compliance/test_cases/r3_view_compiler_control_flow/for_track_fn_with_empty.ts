import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    @for (item of items; track item.id; let i = $index) {
      <div>{{ i }}: {{ item.name }}</div>
    } @empty {
      <div>empty</div>
    }
  `,
})
export class AppComponent {
  items: {id: number; name: string}[] = [];
}
