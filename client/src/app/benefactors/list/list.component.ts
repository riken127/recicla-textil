import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthenticationService } from "../../services/authentication.service";
import { BenefactorsService } from "../../services/benefactors.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Benefactor } from '../../models/benefactor';
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";

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
    FormsModule,
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  benefactors: Benefactor[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  isLoading: boolean = false;
  isEndOfData: boolean = false;
  totalRecords: number = 0;
  recordsFiltered: number = 0;
  draw: number = 1;
  length: number = 10; // Number of records per page
  orderBy: string = 'asc'; // Order direction
  columnIndex: number = 0; // Column to sort by

  constructor(
    private benefactorsService: BenefactorsService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.getBenefactors();
  }

  getBenefactors() {
    if (this.isLoading || this.isEndOfData) {
      return;
    }

    this.isLoading = true;
    const start = (this.currentPage - 1) * this.length;

    this.benefactorsService.getAllBenefactors(this.draw, start, this.length, this.searchTerm, this.orderBy, this.columnIndex)
      .subscribe(response => {
        this.totalRecords = response.recordsTotal;
        this.recordsFiltered = response.recordsFiltered;

        if (response.benefactors.length === 0) {
          this.isEndOfData = true;
        } else {
          this.benefactors.push(...response.benefactors);
          this.currentPage++;
        }
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
        this.showErrorMessage("An error occurred: " + error.message);
      });
  }

  onSearchTermChange() {
    this.currentPage = 1;
    this.benefactors = [];
    this.isEndOfData = false;
    this.getBenefactors();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      this.getBenefactors();
    }
  }

  onClick(id: string) {
    if (!id) {
      return;
    }
    this.router.navigate(['/benefactors/profile/', id]);
  }

  showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
    });
  }
}
