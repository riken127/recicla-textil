import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BenefactorsService} from "../../services/benefactors.service";
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from "@angular/material/button";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-disable-prize',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './disable-prize.component.html',
  styleUrl: './disable-prize.component.css'
})
export class DisablePrizeComponent {
  currentPrize: string = '';
  constructor(
    private benefactorService: BenefactorsService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.route.paramMap.subscribe(params => {
      this.currentPrize = params.get('id') || ''
    })
  }

  onDelete() {
    this.benefactorService.deletePrize(this.currentPrize)
      ?.subscribe(
        result => {
          if (result) {
            this.snackBar.open('Prize disabled successfully', 'Close', {
              duration: 3000
            })
          } else {
            this.snackBar.open('An error has occurred while trying to disable the prize', 'Close', {
              duration: 3000
            });
          }
        }
      )
  }

  onCancel() {
    this.router.navigate(['/user-profile'])
  }
}
