import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BenefactorsService } from '../../services/benefactors.service';
import { Benefactor } from '../../models/benefactor';
import { Post } from '../../models/post';
import { MatCardModule } from '@angular/material/card';
import { AuthenticationService } from '../../services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialog } from '@angular/material/dialog';
import { PostComponent } from '../post/post.component';
import { MatIconModule } from '@angular/material/icon';
import { CreateDonationComponent } from '../../donations/create-donation/create-donation.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatIconModule,
    CreateDonationComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  benefactor?: Benefactor;
  posts: Post[] = [];
  benefactorId: string | null = null;
  gridCols?: number;

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private service: BenefactorsService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.profile();
    this.getToken();
    this.adjustGridCols(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.adjustGridCols((event.target as Window).innerWidth);
  }

  adjustGridCols(width: number) {
    if (width >= 1200) {
      this.gridCols = 3;
    } else if (width >= 800) {
      this.gridCols = 2;
    } else {
      this.gridCols = 1;
    }
  }

  profile() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.getBenefactor(id)?.subscribe((benefactor) => {
        this.benefactor = benefactor;
        this.getAllPosts();
      });
    }
  }

  getToken() {
    this.authService
      .getBenefactorDecodedToken(true, false)
      .subscribe((result) => {
        this.benefactorId = result.id;
      });
  }

  showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
    });
  }

  addDonation() {
    const dialogRef = this.dialog.open(CreateDonationComponent, {
      data: {
        benefactorId: this.benefactor?._id,
      },
      width: '35vw',
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  addPost(id: string) {
    this.router.navigate([id + '/create-post/']);
  }

  editProfile(id: string) {
    this.router.navigate([id + '/edit-benefactor-profile/']);
  }

  getAllPosts() {
    if (!this.benefactor) {
      return;
    }
    this.service.getPosts(this.benefactor._id)?.subscribe((posts) => {
      this.posts = posts;
    });
  }

  openPost(post: Post) {
    window.open(post.title, '_blank');
  }

  openDialog(post: Post) {
    this.dialog.open(PostComponent, {
      data: { post: post },
    });
  }
}
