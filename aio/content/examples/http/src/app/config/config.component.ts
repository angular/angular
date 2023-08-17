// #docplaster
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Config, ConfigService } from './config.service';

@Component({
  standalone: true,
  selector: 'app-config',
  templateUrl: './config.component.html',
  imports: [ CommonModule ],
  providers: [ ConfigService ],
  styles: ['.error { color: #b30000; }']
})
export class ConfigComponent {
  error: any;
  headers: string[] = [];
  // #docregion typed_response, v2
  config: Config | undefined;

  // #enddocregion typed_response, v2
  // #docregion v1
  constructor(private configService: ConfigService) {}

  // #enddocregion v1
  clear() {
    this.config = undefined;
    this.error = undefined;
    this.headers = [];
  }

  // #docregion v1, v2, typed_response, untyped_response
  showConfig() {
    this.configService.getConfig()
  // #enddocregion v1, v2,  typed_response, untyped_response
      .subscribe({
        next: data => this.config = { ...data }, // success path
        error: error => this.error = error, // error path
      });
  }
  showConfig_v1() {
    this.configService.getConfig_1()
  // #docregion  typed_response, v1
      .subscribe(data => this.config = {
          heroesUrl: data.heroesUrl,
          textfile:  data.textfile,
          date: data.date,
      });
  }
  // #enddocregion  typed_response, v1

  showConfig_untyped_response() {
    this.configService.getConfig_untyped_response()
     // #docregion untyped_response
      .subscribe(data => this.config = {
          heroesUrl: (data as any).heroesUrl,
          textfile:  (data as any).textfile,
          date: (data as any).date,
      });
    }
    // #enddocregion untyped_response



  showConfig_v2() {
    this.configService.getConfig()
  // #docregion v2
      // clone the data object, using its known Config shape
      .subscribe(data => this.config = { ...data });
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

