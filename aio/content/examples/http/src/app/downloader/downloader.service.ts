import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { tap } from 'rxjs/operators';

import { MessageService } from '../message.service';

@Injectable()
export class DownloaderService {
  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  // #docregion getTextFile
  getTextFile(filename: string) {
    // 반환 형식을 지정하면 get() 함수가 반환하는 타입을 Observable<string>으로 변경할 수 있습니다.
    // 이 때 get() 함수에 제네릭으로 <string> 타입을 지정할 필요는 없습니다.
    return this.http.get(filename, {responseType: 'text'})
      .pipe(
        tap( // HTTP 응답이나 에러를 로그로 출력합니다.
          data => this.log(filename, data),
          error => this.logError(filename, error)
        )
      );
  }
  // #enddocregion getTextFile

  private log(filename: string, data: string) {
    const message = `DownloaderService downloaded "${filename}" and got "${data}".`;
    this.messageService.add(message);
  }

  private logError(filename: string, error: any) {
    const message = `DownloaderService failed to download "${filename}"; got error "${error.message}".`;
    console.error(message);
    this.messageService.add(message);
  }
}
