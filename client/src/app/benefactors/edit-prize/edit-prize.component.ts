import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {BenefactorsService} from "../../services/benefactors.service";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Prize} from "../../models/prize";
import {ActivatedRoute, Router} from "@angular/router";
import {FileUploadService} from "../../services/file-upload.service";

@Component({
  selector: 'app-edit-prize',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatGridListModule,
    MatDatepickerModule
  ],
  templateUrl: './edit-prize.component.html',
  styleUrl: './edit-prize.component.css'
})
export class EditPrizeComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  fileToUpload: File | null = null;

  constructor(
    private benefactorsService: BenefactorsService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private fileUploadService: FileUploadService
  ) {

  }

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.form = this.formBuilder.group({
        price: [new FormControl("", Validators.required)],
        title: [new FormControl("", Validators.required)],
        description: [new FormControl("", Validators.required)],
        benefactor: [new FormControl(params.get('benefactor')), Validators.required],
      });
      this.benefactorsService.getPrize(params.get('prize') || ' ')
        ?.subscribe(result => {
          console.log(result)
            if (result) {
              this.form.setValue({
                price: result.price,
                title: result.title,
                benefactor: result.benefactor,
                description: result.description
              });
            }
          },
          error => {
            this.snackBar.open(error?.message || 'An error occurred', 'Close', {
              duration: 3000
            });
          });
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.route.paramMap.subscribe((params) => {
      const updatedPrize = new Prize(
        params.get('prize') || '',
        this.f['price'].value,
        this.f['title'].value,
        this.f['description'].value,
        '',
        params.get('benefactor') || ''
      );

    if (!updatedPrize)
      return;

    this.benefactorsService.updatePrize(
      updatedPrize
    )
      .subscribe(
        result => {
          if (this.fileToUpload) {
            this.fileUploadService.uploadPrizeImage(
              this.fileToUpload,
              params.get('benefactor') || '',
              updatedPrize._id
            )
              .subscribe(
                uploadResult => {
                  this.snackBar.open('Prize and image have been updated', 'Close', {
                    duration: 3000
                  }).afterDismissed().subscribe(() => {
                    this.router.navigate(['/']);
                  })
                },
                uploadError => {
                  this.snackBar.open('Prize created, but image upload failed.', 'Close', {
                    duration: 3000
                  })
                }
              );
          } else {
            this.snackBar.open('Prize has been updated', 'Close', {
              duration: 3000,
            }).afterDismissed().subscribe(() => {
              this.router.navigate(['/']);
            });
          }
        },
        error => {
          this.snackBar.open(error?.message || 'An error occurred', 'Close', {
            duration: 3000
          });
        }
      );
    });
    this.onReset();
  }

  onReset() {
    this.route.paramMap.subscribe(params => {
      this.submitted = false;
      this.form.reset();
      this.form.patchValue({
        benefactor: params.get('id'),
      })
    })
  }

  onFileSelected(event: any) {
    this.fileToUpload = event.target.files[0];
  }
}
