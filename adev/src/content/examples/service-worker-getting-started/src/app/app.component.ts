import {Component, inject} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'Service Workers';
  updateCheckText = '';

  private update = inject(SwUpdate);

  updateCheck(): void {
    this.update
      .checkForUpdate()
      .then(() => (this.updateCheckText = 'resolved'))
      .catch((err) => (this.updateCheckText = `rejected: ${err.message}`));
  }
}
