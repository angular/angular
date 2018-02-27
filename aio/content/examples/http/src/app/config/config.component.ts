// #docplaster
// #docregion
import { Component } from '@angular/core';
import { Config, ConfigService } from './config.service';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  providers: [ ConfigService ],
  styles: ['.error {color: red;}']
})
export class ConfigComponent {
  error: any;
  headers: string[];
  // #docregion v2
  config: Config;

  // #enddocregion v2
  constructor(private configService: ConfigService) {}

  clear() {
    this.config = undefined;
    this.error = undefined;
    this.headers = undefined;
  }

  // #docregion v1, v2, v3
  showConfig() {
    this.configService.getConfig()
  // #enddocregion v1, v2
      .subscribe(
        (data: Config) => this.config = { ...data }, // success path
        error => this.error = error // error path
      );
  }
  // #enddocregion v3

  showConfig_v1() {
    this.configService.getConfig_1()
  // #docregion v1, v1_callback
      .subscribe((data: Config) => this.config = {
          heroesUrl: data['heroesUrl'],
          textfile:  data['textfile']
      });
  // #enddocregion v1_callback
  }
  // #enddocregion v1

  showConfig_v2() {
    this.configService.getConfig()
  // #docregion v2, v2_callback
      // clone the data object, using its known Config shape
      .subscribe((data: Config) => this.config = { ...data });
  // #enddocregion v2_callback
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
        this.config = { ... resp.body };
      });
  }
// #enddocregion showConfigResponse
  makeError() {
    this.configService.makeIntentionalError().subscribe(null, error => this.error = error );
  }
}
// #enddocregion
