import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BenefactorsService } from '../../services/benefactors.service';
import { Benefactor } from '../../models/benefactor';
import { Post } from '../../models/post';
import { MatCardModule } from '@angular/material/card';
import { AuthenticationService } from "../../services/authentication.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialog } from '@angular/material/dialog';
import { PostComponent } from '../post/post.component';
import { MatIconModule } from '@angular/material/icon';
import { EditProfileComponent } from '../edit-profile/edit-profile.component';
import { CreatePostComponent } from '../create-post/create-post.component';
import { EditPostComponent } from '../edit-post/edit-post.component';
import { ListWaitingDonationsComponent } from '../../donations/list-waiting-donations/list-waiting-donations.component';
import { CreateDonationComponent } from '../../donations/create-donation/create-donation.component';
import { ListPickpointsComponent } from '../list-pickpoints/list-pickpoints.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatIconModule,
    ListWaitingDonationsComponent,
    ListPickpointsComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
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
    private router: Router,
  ) {
  }

  ngOnInit() {
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
      this.service.getBenefactor(id)?.subscribe(benefactor => {
        this.benefactor = benefactor;
        this.benefactor.description= this.truncateDescription(this.benefactor);
        this.getAllPosts();
      });
    }
  }

  getToken() {
    this.authService.getBenefactorDecodedToken(true, false).subscribe(result => {
      this.benefactorId = result.id;
      this.profile();
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
    });
  }

  openAddPost(benefactor: Benefactor) {
    this.dialog.open(CreatePostComponent, {
      data: { benefactor: benefactor },
    }).afterClosed().subscribe(result => {
      location.reload();
    });
  }

  openEditPost(post: Post) {
    this.dialog.open(EditPostComponent, {
      data: { post: post },
    }).afterClosed().subscribe(result => {
      location.reload();
    });
  }

  getAllPosts() {
    if (!this.benefactor) {
      return;
    }
    this.service.getPosts(this.benefactor._id)?.subscribe(posts => {
      this.posts = posts;
    });
  }

  openEditProfile(benefactor: Benefactor) {
    this.dialog.open(EditProfileComponent, {
      data: { benefactor: benefactor },
    }).afterClosed().subscribe(result => {
      location.reload();
    });
  }

   truncateDescription(benefactor: Benefactor): string {
    const maxLength = 400;
    if (benefactor.description.length > maxLength) {
      return benefactor.description.substring(0, maxLength) + " ...";
    }
    return benefactor.description;
  }

  openPost(post: Post) {
    this.dialog.open(PostComponent, {
      data: { post: post },
    });
  }

  getLogoUrl(): string {
    return this.benefactor?.logo
      ? this.parseImageUrl(this.benefactor.logo)
      : `url(https://api.dicebear.com/8.x/shapes/svg?seed=${this.benefactor?.email})`;
  }

  getBannerUrl(): string {
    return this.benefactor?.banner
      ? this.parseImageUrl(this.benefactor.banner)
      : `url(https://api.dicebear.com/8.x/shapes/svg?seed=${this.benefactor?.phone})`;
  }

  parseImageUrl(url: string): string {
    return `url(http://localhost:3000/${url.replace(/\\/g, '/')})`;
  }

}