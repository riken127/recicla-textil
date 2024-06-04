import {Component, HostListener, OnInit} from '@angular/core';
import {Post} from "../../models/post";
import {BenefactorsService} from "../../services/benefactors.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton, MatIconButton} from "@angular/material/button";
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
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {NgForOf, NgIf, NgStyle} from "@angular/common";

@Component({
  selector: 'app-all-posts',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    MatIconButton,
    MatIcon,
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardTitle,
    MatCardSubtitle,
    MatCardActions,
    MatButton,
    MatProgressSpinner,
    NgIf,
    NgStyle,
    NgForOf
  ],
  templateUrl: './all-posts.component.html',
  styleUrl: './all-posts.component.css'
})
export class AllPostsComponent implements OnInit {
  posts: Post[] = [];
  page = 0;
  pageSize = 20;
  loading = false;
  allLoaded = false;

  constructor(
    private benefactorService: BenefactorsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit() {
    this.getPosts();
  }

  getPosts() {
    if (this.loading || this.allLoaded) {
      return;
    }

    this.loading = true;
    this.benefactorService.getLastPosts(this.page, this.pageSize)
      ?.subscribe(posts => {
        if (posts.length > 0) {
          this.posts = [...this.posts, ...posts];
          this.page++;
        } else {
          this.allLoaded = true;
        }
        this.allLoaded = false;
      }, error => {
        this.loading = false;
        this.showErrorMessage('An error occurred: ' + error.message);
      });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100)) {
      this.getPosts();
    }
  }

  onClick(id: string) {
    if (!id) {
      return;
    }
    this.router.navigate(['/benefactors/profile', id]);
  }

  showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
    })
  }
}
