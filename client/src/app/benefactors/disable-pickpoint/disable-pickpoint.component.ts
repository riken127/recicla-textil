import { Component } from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardTitle} from "@angular/material/card";
import {BenefactorsService} from "../../services/benefactors.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-disable-pickpoint',
  standalone: true,
    imports: [
        MatButton,
        MatCard,
        MatCardContent,
        MatCardTitle
    ],
  templateUrl: './disable-pickpoint.component.html',
  styleUrl: './disable-pickpoint.component.css'
})
export class DisablePickpointComponent {
  constructor(
    private benefactorsService: BenefactorsService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: DialogRef
  ) {
  }

  onDelete() {
    this.route.paramMap.subscribe(params => {
      this.benefactorsService.deletePickpoint(<string>params.get('benefactor'), <string>params.get('pickpoint'))
        ?.subscribe(
          result => {
            if (result === true) {
              this.snackBar.open('Pickpoint disabled successfully!', 'Close', {
                duration: 3000,
              })
              this.dialog.close()
            } else {
              this.snackBar.open('An error has occurred while trying to disable the offer', 'Close', {
                duration: 3000,
              })
            }
          }
        );
    })
  }

  onCancel() {
    this.dialog.close()
  }
}
