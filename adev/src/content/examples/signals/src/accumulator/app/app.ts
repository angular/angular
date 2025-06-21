import {Component, signal, linkedSignal} from '@angular/core';

@Component({
  selector: 'app-accumulator',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class Accumulator {
  nextPageData = signal<string[]>([]);
  page = 1;

  allItems = linkedSignal<string[], string[]>({
    source: () => this.nextPageData(),
    computation: (newData, previous) => {
      const initialValue = ['Item A', 'Item B', 'Item C'];
      return [...(previous?.value ?? initialValue), ...newData];
    },
  });

  loadNextPage() {
    this.page++;
    // In a real app, this would come from an API call
    const moreItems = [`Page ${this.page} Item 1`, `Page ${this.page} Item 2`];
    this.nextPageData.set(moreItems);
  }
}
