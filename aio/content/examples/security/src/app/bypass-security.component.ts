// #docplaster
// #docregion
import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-bypass-security',
  templateUrl: './bypass-security.component.html',
})
export class BypassSecurityComponent {
  dangerousUrl: string;
  trustedUrl: SafeUrl;
  dangerousVideoUrl: string;
  videoUrl: SafeResourceUrl;

  // #docregion trust-url
  constructor(private sanitizer: DomSanitizer) {
    // javscript: 와 같은 코드가 직접 실행되는 것은 위험합니다.
    // 그래서 Angular는 이 코드를 데이터 바인딩할 때 자동으로 안전성 검사를 실행하지만,
    // 이 코드를 안전한 것으로 간주하고 안전성 검사를 실행하지 않을 수도 있습니다.
    this.dangerousUrl = 'javascript:alert("Hi there")';
    this.trustedUrl = sanitizer.bypassSecurityTrustUrl(this.dangerousUrl);
    // #enddocregion trust-url
    this.updateVideoUrl('PUBnlbjZFAI');
  }

  // #docregion trust-video-url
  updateVideoUrl(id: string) {
    // YouTube URL에 ID를 조합한 문자열은 안전한 URL입니다.
    // 그렇다면 이렇게 조합된 URL은 언제나 안전하다고 간주하고 자동으로 실행되는 안전성 검사를 생략할 수 있습니다.
    this.dangerousVideoUrl = 'https://www.youtube.com/embed/' + id;
    this.videoUrl =
        this.sanitizer.bypassSecurityTrustResourceUrl(this.dangerousVideoUrl);
  }
  // #enddocregion trust-video-url
}
