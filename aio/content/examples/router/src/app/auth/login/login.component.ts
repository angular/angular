// #docregion
import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  message: string;

  constructor(public authService: AuthService, public router: Router) {
    this.setMessage();
  }

  setMessage() {
    this.message = 'Logged ' + (this.authService.isLoggedIn ? 'in' : 'out');
  }

  login() {
    this.message = 'Trying to log in ...';

    this.authService.login().subscribe(() => {
      this.setMessage();
      if (this.authService.isLoggedIn) {
        // 보통은 AuthService에서 리다이렉트할 URL을 가져옵니다.
        // 하지만 예제를 간단하게 구성하기 위해 `/admin`으로 리다이렉트 합시다.
        const redirectUrl = '/admin';

        // #docregion preserve
        // 전역 쿼리 파라미터와 프래그먼트를 NavigationExtras 객체타입으로 전달합니다.
        const navigationExtras: NavigationExtras = {
          queryParamsHandling: 'preserve',
          preserveFragment: true
        };

        // 리다이렉트 합니다.
        this.router.navigate([redirectUrl], navigationExtras);
        // #enddocregion preserve
      }
    });
  }

  logout() {
    this.authService.logout();
    this.setMessage();
  }
}
