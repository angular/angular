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
        (data: Config) => this.config = { ...data }, // 성공한 경우 실행되는 함수
        error => this.error = error // 에러가 발생한 경우 실행되는 함수
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
      // Config 타입을 알기 때문에 클래스 프로퍼티로 바로 할당할 수 있습니다.
      .subscribe((data: Config) => this.config = { ...data });
  // #enddocregion v2_callback
  }
  // #enddocregion v2

// #docregion showConfigResponse
  showConfigResponse() {
    this.configService.getConfigResponse()
      // 반환 형식은 `HttpResponse<Config>` 입니다.
      .subscribe(resp => {
        // 헤더를 확인합니다.
        const keys = resp.headers.keys();
        this.headers = keys.map(key =>
          `${key}: ${resp.headers.get(key)}`);

        // `HttpResponse` 객체의 body 프로퍼티는 `Config` 타입입니다.
        this.config = { ... resp.body };
      });
  }
// #enddocregion showConfigResponse
  makeError() {
    this.configService.makeIntentionalError().subscribe(null, error => this.error = error );
  }
}
// #enddocregion
