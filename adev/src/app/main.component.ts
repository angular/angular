import {Component, effect, inject, model, WritableSignal} from '@angular/core';
import {IS_SEARCH_DIALOG_OPEN, Search} from '@angular/docs';
import {RouterOutlet} from '@angular/router';

@Component({
  standalone: true,
  selector: 'adev-main',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export default class MainComponent {
  private readonly displaySearchDialog: WritableSignal<boolean> = inject(IS_SEARCH_DIALOG_OPEN);
  private readonly searchService = inject(Search);
  search = model<string | undefined>('');

  constructor() {
    effect(
      () => {
        const search = this.search();
        if (search !== undefined) {
          this.displaySearchDialog.set(true);
          this.searchService.updateSearchQuery(search);
        }
      },
      {allowSignalWrites: true},
    );
  }
}
