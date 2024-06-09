import {Component, OnInit,Inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {MatGridListModule} from '@angular/material/grid-list';
import {BenefactorsService} from '../../services/benefactors.service';
import {Post} from '../../models/post';
import {Benefactor} from '../../models/benefactor';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatGridListModule,
  ],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
benefactorId: string | null = null;
  constructor(
    private benefactorService: BenefactorsService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<CreatePostComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { benefactor: Benefactor }
  ) {
    this.benefactorId = data.benefactor._id;
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.form = this.formBuilder.group({
        benefactorId: [this.benefactorId],
        title: ['', Validators.required, ],
        content: ['', Validators.required],
        image: [''],
        links: this.formBuilder.array([])
      });
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const newPost = new Post(
      "",
      this.f['benefactorId'].value,
      this.f['title'].value,
      this.f['content'].value,
      this.f['image'].value,
      new Date(),
      new Date(),
      []
    );

    this.benefactorService.addPost(newPost)?.subscribe(
      () => {
        this.snackBar.open('Post created successfully', 'Close', {
          duration: 2000,
        });
      },
      (error) => {
        this.snackBar.open('Error creating post', 'Close', {
          duration: 2000,
        });
      }
    );
    this.dialogRef.close();
  }

  onReset() {
    this.submitted = false;
    this.form.reset();
  }
}
