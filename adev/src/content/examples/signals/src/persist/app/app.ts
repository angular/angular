import {Component, signal, linkedSignal, resource} from '@angular/core';

@Component({
  selector: 'app-persist',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class Persist {
  version = signal(1);

  dataResource = resource({
    params: () => this.version(),
    loader: async ({params}) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (params === 1) {
        return 'Initial Data';
      }
      return `New Data v${params}`;
    },
    defaultValue: 'Initial Data',
  });

  displayData = linkedSignal<string, string>({
    source: () => this.dataResource.value(),
    computation: (newValue, previous) => {
      const initial = 'Initial Data';
      if (this.dataResource.isLoading() && previous) {
        return previous.value;
      }
      return newValue ?? initial;
    },
  });

  fetchData() {
    this.version.update((v) => v + 1);
  }
}
