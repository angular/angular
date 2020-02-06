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
        // Get the redirect URL from our auth service
        // If no redirect has been set, use the default
        let redirectUrl = this.authService.redirectUrl || '/admin';

        // If the redirectUrl contains an aux outlet name /admin(popup:compose)
        // Then get rid of that and just take the first part of the Url.
        if (redirectUrl.indexOf('(') !== -1) {
          redirectUrl = redirectUrl.split('(')[0];
        }

        // #docregion preserve
        // Set our navigation extras object
        // that passes on our global query params and fragment
        let navigationExtras: NavigationExtras = {
          queryParamsHandling: 'preserve',
          preserveFragment: true
        };

        // Redirect the user
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
