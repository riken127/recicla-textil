import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent {

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) { }

  benefactors() {
    this.router.navigate(['/benefactors']);
  }

  profile() {
    this.authenticationService.getDecodedToken(true, false, false, false).subscribe((decodedToken: any) => {
      if (decodedToken.type === 'benefactor') {
        this.router.navigate(['/benefactors/profile/' + decodedToken.id]);
      }
      else if (decodedToken.type === 'user') {
        this.router.navigate(['/user-profile/']);
      }
      else {
        this.router.navigate(['/']);
      }
    }
    );
  }

  logout() {
    this.authenticationService.logout().subscribe(() => {
      this.router.navigate(['/login']).then(() => {
        window.location.reload();
      });
    });
  }

  home() {
    this.router.navigate(['/']);
  }

  store() {
    this.router.navigate(['/prizes']);
  }
}
