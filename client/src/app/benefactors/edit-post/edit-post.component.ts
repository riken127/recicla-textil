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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: BenefactorsService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditPostComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { post: Post }
  ) {
    this.post = data.post;
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      image: ['', Validators.required]
    });

    this.form.patchValue(this.post);
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const postData = this.form.value;
    postData['_id'] = this.post._id;

    this.service.updatePost(postData)?.subscribe(
      response => {
        this.snackBar.open('Post updated successfully', 'Close', {
          duration: 3000
        }).afterDismissed().subscribe(() => {
          this.router.navigate(['/posts/' + postData['_id']]);
        });
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
}
