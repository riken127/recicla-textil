import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user';
import { MatCardModule } from '@angular/material/card';
import { AuthenticationService } from '../../services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ListDonationsComponent } from '../../donations/list/list-donations.component';
import { UserEditComponent } from '../user-edit/user-edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatIconModule,
    MatDividerModule,
    ListDonationsComponent,
    UserEditComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  user?: User;
  userId: string | null = null;
  image: string = '';

  constructor(
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private service: UsersService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authenticationService
      .getDecodedToken(true, false, false,false)
      .subscribe((result) => {
        this.userId = result.id;
        if (this.userId) {
          this.getUser(this.userId);
        }
      });
  }

  getUser(userId: string) {
    this.service.getUser(userId)?.subscribe((user: User) => {
      this.user = user;
      this.getImage(user.image);
    });
  }

  editProfile(userId: String) {
    const dialogRef = this.dialog.open(UserEditComponent, {
      data: this.user,
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (this.userId) {
        if (result === 'deleted') {
          this.router.navigate(['/login']);
        } else if (result === 'updated') {
          this.getUser(this.userId);
        }
      }
    });
  }

  earnLeafs() {
    this.router.navigate(['/benefactors']);
  }

  spendLeafs() {
    this.router.navigate(['/prizes']);
  }

  getImage(image : string) {
    this.image= image
      ? this.parseImageUrl(image)
      : `url(https://picsum.photos/500/500)`;
  }

  parseImageUrl(url: string): string {
    return `url(http://localhost:3000/${url.replace(/\\/g, '/')})`;
  }
}
