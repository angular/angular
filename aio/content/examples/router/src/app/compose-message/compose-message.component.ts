// #docregion
import { Component, HostBinding } from '@angular/core';
import { Router }                 from '@angular/router';

@Component({
  selector: 'app-compose-message',
  templateUrl: './compose-message.component.html',
  styleUrls: ['./compose-message.component.css']
})
export class ComposeMessageComponent {
  details: string;
  message: string;
  sending = false;

  constructor(private router: Router) {}

  send() {
    this.sending = true;
    this.details = 'Sending Message...';

    setTimeout(() => {
      this.sending = false;
      this.closePopup();
    }, 1000);
  }

  cancel() {
    this.closePopup();
  }

  // #docregion closePopup
  closePopup() {
    // 이름을 지정한 라우팅 영역에 `null` 값을 지정하면 라우팅 영역의 내용을 모두 비웁니다.
    this.router.navigate([{ outlets: { popup: null }}]);
  }
  // #enddocregion closePopup
}
