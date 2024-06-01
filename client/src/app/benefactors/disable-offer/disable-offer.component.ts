import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BenefactorsService} from '../../services/benefactors.service';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-disable-offer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './disable-offer.component.html',
  styleUrl: './disable-offer.component.css'
})

export class DisableOfferComponent {
  currentBenefactor: string = '';
  currentOffer: string = '';
  constructor(
    private benefactorsService: BenefactorsService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.route.paramMap.subscribe(params => {
      this.currentBenefactor = params.get('benefactor') || '';
      this.currentOffer = params.get('offer') || '';
    })
  }

  onDelete() {
    this.benefactorsService.disableOffer(this.currentBenefactor, this.currentOffer)
      ?.subscribe(
        result => {
          if (result === true) {
            this.snackBar.open('Offer disabled successfully!', 'Close', {
              duration: 3000,
            }).afterDismissed().subscribe(() => {
              this.router.navigate(['/']);
            })
          } else {
            this.snackBar.open('An error has occurred while trying to disable the offer', 'Close', {
              duration: 3000,
            })
          }
        }
      );
  }

  onCancel() {
    this.router.navigate(['/']);
  }
}
