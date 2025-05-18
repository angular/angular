import {Component, resource, signal} from '@angular/core';

@Component({
  selector: 'app-root',
  template: ` <p>{{ characters.value() }}</p> `,
  styles: `p { max-width: 600px; }`,
})
export class AppComponent {
  readonly url = '/api/stream-response';
  readonly decoder = new TextDecoder();

  characters = resource({
    stream: async () => {
      const data = signal<{value: string} | {error: unknown}>({
        value: '',
      });

      fetch(this.url).then(async (response) => {
        if (response.body) {
          for await (const chunk of response.body) {
            const chunkText = this.decoder.decode(chunk);
            data.update((prev) => {
              if ('value' in prev) {
                return {value: `${prev.value} ${chunkText}`};
              } else {
                return {error: chunkText};
              }
            });
          }
        }
      });

      return data;
    },
  });
}
