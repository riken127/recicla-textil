import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Post } from '../../models/post';
import { Benefactor } from '../../models/benefactor';
import { BenefactorsService } from '../../services/benefactors.service';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.css']
})
export class EditPostComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  post: Post;
  fileToUpload: File | null = null;
  benefactorId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: BenefactorsService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditPostComponent>,
    public fileUploadService: FileUploadService,
    @Inject(MAT_DIALOG_DATA) public data: { post: Post, benefactorId: string }
  ) {
    this.post = data.post;
    this.benefactorId = data.benefactorId;
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
    });

    this.form.patchValue(this.post);
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    let postData;

    if (this.benefactorId) {
      postData = new Post(
        this.post._id,
        this.benefactorId,
        this.f['title'].value,
        this.f['content'].value,
        this.fileToUpload ? 'y' : '',
        this.post.createdAt,
        this.post.updatedAt,
        this.post.links
      );

    this.service.updatePost(postData)!.subscribe(
      response => {
        if (this.fileToUpload && this.benefactorId) {
          this.fileUploadService.uploadPostImage(this.fileToUpload, this.benefactorId,this.post._id)?.subscribe(
            response => {
              this.snackBar.open('Post updated successfully', 'Close', {
                duration: 3000
              })
            },
            error => {
              this.snackBar.open('Failed to update post image', 'Close', {
                duration: 3000
              });
            }
          );
        } else {
          this.snackBar.open('Post updated successfully', 'Close', {
            duration: 3000
          })
        }
      },
      error => {
        this.snackBar.open('Failed to update post', 'Close', {
          duration: 3000
        });
      }
    );
    this.onReset();
    this.dialogRef.close();
  }
  }

  onReset() {
    this.submitted = false;
    this.form.reset();
  }

  onDelete() {
    this.service.deletePost(this.post)?.subscribe(
      response => {
        this.snackBar.open('Post deleted successfully', 'Close', {
          duration: 3000
        }).afterDismissed().subscribe(() => {
          this.router.navigate(['/posts']);
          this.dialogRef.close();
        });
      },
      error => {
        this.snackBar.open('Failed to delete post', 'Close', {
          duration: 3000
        });
      }
    );
  }

  onFileSelected(event: any) {
    this.fileToUpload = event.target.files[0];
  }
}
