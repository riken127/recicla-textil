import {Component, HostListener, OnInit} from '@angular/core';
import {Prize} from "../../models/prize";
import {BenefactorsService} from "../../services/benefactors.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatIcon} from "@angular/material/icon";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from "@angular/material/card";
import {NgForOf, NgIf, NgStyle} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

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

  constructor(
    private benefactorsService: BenefactorsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit() {
    this.getPrizes();
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

  onClick(id: string) {
    if (!id) {
      return;
    }
    this.router.navigate(['/']);
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
