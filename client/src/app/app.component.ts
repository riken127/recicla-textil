import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { TopBarComponent } from './top-bar/top-bar.component';
import { AuthenticationService } from './services/authentication.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TopBarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'client';
  loggedIn?: boolean;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
    this.isLoggedIn();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isLoggedIn();
    });
  }

  isLoggedIn() {
    this.authenticationService.isLoggedIn().subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
  }
}
