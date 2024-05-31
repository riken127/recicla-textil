import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators,} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Item, Weight} from '../../models/item';
import {DonationsService} from '../../services/donations.service';

@Component({
  selector: 'app-create-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-item.component.html',
  styleUrl: './create-item.component.css',
})
export class CreateItemComponent implements OnInit {
  itemForm: FormGroup = this.formBuilder.group({
    brand: ['', Validators.required],
    weightValue: ['', Validators.required],
    weightUnit: ['', Validators.required],
    size: ['', Validators.required],
    type: ['', Validators.required],
    photo: [null],
  });
  donationId: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private donationsService: DonationsService
  ) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.donationId = params.get('id');
    });
  }

  onSubmit() {
    if (this.itemForm.valid && this.donationId) {
      const {brand, weightValue, weightUnit, size, type, photo} = this.itemForm.value;
      const weight = new Weight(weightValue, weightUnit);
      const item = new Item(undefined, brand, weight, size, type, photo);

      this.donationsService
        .addItem(this.donationId, item)
        ?.subscribe((success) => {
          if (success) {
            this.snackBar.open('Item added successfully', '', {
              duration: 2000,
            });
            this.router.navigate([this.donationId, 'list-items']);
          } else {
            this.snackBar.open('Error adding item', '', {duration: 2000});
          }
        });
    }
  }
}
