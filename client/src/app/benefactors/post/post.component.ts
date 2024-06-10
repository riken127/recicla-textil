import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Post } from '../../models/post';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {
  public post: Post;

  constructor(
    public dialogRef: MatDialogRef<PostComponent>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: { post: Post }
  ) {
    this.post = data.post;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onLinkClick(link: string): void {
    window.open(link, '_blank');
  }

  getPostImageUrl(image: string): SafeUrl {
    return image
      ? this.parseImageUrl(image)
      : this.sanitizer.bypassSecurityTrustUrl('https://picsum.photos/500/500');
  }

  parseImageUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(`http://localhost:3000/${url.replace(/\\/g, '/')}`);
  }

}
