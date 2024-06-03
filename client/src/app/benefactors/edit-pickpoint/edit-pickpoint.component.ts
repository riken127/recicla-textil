import {Component, OnInit} from '@angular/core';
import {Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {BenefactorsService} from "../../services/benefactors.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Pickpoint} from "../../models/pickpoint";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardTitle} from "@angular/material/card";
import {MatError, MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-edit-pickpoint',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatError,
    MatFormField,
    MatInput,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './edit-pickpoint.component.html',
  styleUrl: './edit-pickpoint.component.css'
})
export class EditPickpointComponent implements OnInit{
  form!: FormGroup;
  submitted = false;

  constructor(
    private benefactorsService: BenefactorsService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  )  { }

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.form = this.formBuilder.group({
        street: ['', Validators.required],
        postalCode: ['', Validators.required],
        city: ['', Validators.required],
        country: ['', Validators.required],
      })

      this.benefactorsService.getPickpoint(<string>params.get('benefactor'), <string>params.get('pickpoint'))
        ?.subscribe(result => {
          if (result) {
            this.form.setValue({
              street: result.street,
              postalCode: result.postalCode,
              city: result.city,
              country: result.country,
            });
          }
        },
          error => {
            this.snackBar.open(error?.error?.message || 'An error occurred', 'Close', {
              duration: 3000
            })
          });
      });
    }

    onSubmit() {
      this.submitted = true;

      if (this.form.invalid) {
        return;
      }
      this.route.paramMap.subscribe((params) => {
        const updatedPickpoint = new Pickpoint(
          <string>params.get('pickpoint'),
          this.f['street'].value,
          this.f['city'].value,
          this.f['postalCode'].value,
          this.f['country'].value,
          true
        )

        if (!updatedPickpoint) {
          return;
        }

        this.benefactorsService.updatePickpoint(<string>params.get('benefactor'),
          <string>params.get('pickpoint'), updatedPickpoint)
          ?.subscribe(
            result => {
              this.snackBar.open('Pickpoint has been updated', 'Close', {
                duration: 3000,
              }).afterDismissed().subscribe(() => {
                this.router.navigate(['/']);
              })
            },
            error => {
              this.snackBar.open(error?.error?.message || 'An error occurred', 'Close', {
                duration: 3000
              });
            }
          );
        this.onReset();
      });
    }

    onReset() {
    this.submitted = false;
    this.form.reset();
    }
}
