// #docplaster
// #docregion
import { Component } from '@angular/core';
import { Config, ConfigService } from './config.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  providers: [ ConfigService ],
  styles: ['.error { color: #b30000; }']
})
export class ConfigComponent {
  error: any;
  headers: string[] = [];
  // #docregion v2
  config: Config | undefined;

  // #enddocregion v2
  constructor(private configService: ConfigService) {}

  clear() {
    this.config = undefined;
    this.error = undefined;
    this.headers = [];
  }

  // #docregion v1, v2
  showConfig() {
    this.configService.getConfig()
  // #enddocregion v1, v2
      .subscribe({
        next: (data: Config) => this.config = { ...data }, // success path
        error: error => this.error = error, // error path
      });
  }

  showConfig_v1() {
    this.configService.getConfig_1()
  // #docregion v1
      .subscribe((data: Config) => this.config = {
          heroesUrl: data.heroesUrl,
          textfile:  data.textfile,
          date: data.date,
      });
  }
  // #enddocregion v1

  showConfig_v2() {
    this.configService.getConfig()
  // #docregion v2
      // clone the data object, using its known Config shape
      .subscribe((data: Config) => this.config = { ...data });
  }
  // #enddocregion v2

// #docregion showConfigResponse
  showConfigResponse() {
    this.configService.getConfigResponse()
      // resp is of type `HttpResponse<Config>`
      .subscribe(resp => {
        // display its headers
        const keys = resp.headers.keys();
        this.headers = keys.map(key =>
          `${key}: ${resp.headers.get(key)}`);

        // access the body directly, which is typed as `Config`.
        this.config = { ...resp.body! };
      });
  }
// #enddocregion showConfigResponse
  makeError() {
    this.configService.makeIntentionalError().subscribe({ error: error => this.error = error.message });
  }

  getType(val: any): string {
    return val instanceof Date ? 'date' : Array.isArray(val) ? 'array' : typeof val;
  }
}
// #enddocregion
