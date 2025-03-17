import { Component } from "@angular/core";

@Component({
    selector: 'app-auth-landing',
    template: `
    
    <div class="auth-landing"></div>
    `,
    styles: [`
    .auth-landing {
      width: 100%;
      height: 100vh;
      background-image: url('/assets/auth-bg.svg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    `]
})
export class AuthLandingComponent {

}