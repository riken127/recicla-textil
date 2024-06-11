import { Component, HostListener, OnInit } from '@angular/core';
import { Prize } from "../../models/prize";
import { BenefactorsService } from "../../services/benefactors.service";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatGridList, MatGridTile } from "@angular/material/grid-list";
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from "@angular/material/card";
import { NgForOf, NgIf, NgStyle } from "@angular/common";
import { MatButton } from "@angular/material/button";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { AuthenticationService } from '../../services/authentication.service';
import { UsersService } from '../../services/users.service';
import { MatDialog } from '@angular/material/dialog';
import { CodeComponent } from '../code/code.component';
import { User } from '../../models/user';

@Component({
  selector: 'app-all-prizes',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    FormsModule,
    MatIcon,
    MatGridList,
    MatCard,
    MatCardHeader,
    NgStyle,
    MatButton,
    MatCardActions,
    MatCardContent,
    MatCardSubtitle,
    MatCardTitle,
    MatProgressSpinner,
    NgIf,
    NgForOf,
    MatGridTile
  ],
  templateUrl: './all-prizes.component.html',
  styleUrl: './all-prizes.component.css'
})
export class AllPrizesComponent implements OnInit {
  prizes: Prize[] = [];
  page = 0;
  pageSize = 20;
  loading = false;
  allLoaded = false;
  searchQuery = '';
  authenticated: any;

  constructor(
    private benefactorsService: BenefactorsService,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthenticationService,
    private usersService: UsersService,
    public dialog: MatDialog,
  ) {
  }

  ngOnInit() {
    this.getPrizes();
    this.authService.getDecodedToken(true, false, false, false).subscribe((decodedToken: any) => {
      this.authenticated = decodedToken;
    });
  }

  getPrizes() {
    if (this.loading || this.allLoaded) {
      return;
    }

    this.loading = true;

    this.benefactorsService.getAllPrizes(this.page, this.pageSize, this.searchQuery)
      ?.subscribe(prizes => {
        if (prizes.length > 0) {
          this.prizes = [...this.prizes, ...prizes];
          this.page++;
        } else {
          this.allLoaded = true;
        }
        this.loading = false;
      }, error => {
        this.loading = false;
        this.showErrorMessage('An error occurred: ' + error.message);
      });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100)) {
      this.getPrizes();
    }
  }

  redeemPrize(prize: Prize) {
    this.usersService.getUser(this.authenticated.id).subscribe((user: User) => {
      if (user.leafs >= prize.price) {
        this.usersService.redeemPrize(prize._id, user).subscribe((result) => {
          this.dialog.open(CodeComponent, {
            data: {
              code: result.body.message
            }
          })
        }, error => {
          this.showErrorMessage('An error occurred: ' + error.message);
        });
      } else {
        this.showErrorMessage('You do not have enough points to redeem this prize!');
      }
    });

  }

  onSearch() {
    this.prizes = [];
    this.page = 0;
    this.allLoaded = false;
    this.getPrizes();
  }

  showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000
    });
  }

  getImageUrl(prize: Prize): string {
    return prize.image
      ? this.parseImageUrl(prize.image)
      : `url(https://api.dicebear.com/8.x/shapes/svg?seed=${prize._id})`;
  }

  parseImageUrl(url: string): string {
    return `url(http://localhost:3000/${url.replace(/\\/g, '/')})`;
  }
}
