import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatButtonModule} from '@angular/material/button';
import {Benefactor} from '../../models/benefactor';
import {Router} from '@angular/router';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {AuthenticationService} from "../../services/authentication.service";
import {BenefactorsService} from "../../services/benefactors.service";
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent {
  benefactors: Benefactor[] = [];

  constructor(
    private authenticationService: AuthenticationService,
    private benefactorsService: BenefactorsService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.getBenefactors();
  }

  getBenefactors() {

    this.authenticationService.authenticateUser({
      username: 'anakin',
      password: '123'
    }).subscribe(() => {
    }, error => {
      this.showErrorMessage("An error occured: " + error.message);
    });

    this.benefactorsService.getAllBenefactors()?.subscribe(benefactors => {
      this.benefactors = benefactors;
    }, error => {
      this.showErrorMessage("An error occured: " + error.message);
    });
  }

  onClick(id: string) {
    if (!id) {
      return;
    }
    this.router.navigate(['/benefactors/', id]);
  }

  showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
    });
  }

}
