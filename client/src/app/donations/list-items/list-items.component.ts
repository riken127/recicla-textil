import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatButtonModule} from '@angular/material/button';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute, Router} from '@angular/router';
import {DonationsService} from '../../services/donations.service';
import {Item} from '../../models/item';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-list-items',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
  ],
  templateUrl: './list-items.component.html',
  styleUrl: './list-items.component.css',
})
export class ListItemsComponent implements OnInit {
  items: Item[] = [];
  dataSource = new MatTableDataSource<Item>(this.items);
  displayedColumns: string[] = ['brand', 'weight', 'size', 'type'];
  donationId: string | null = null;

  constructor(
    private snackBar: MatSnackBar,
    private donationsService: DonationsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.donationId = params.get('id');
      this.getItems();
    });
  }

  getItems() {
    if (this.donationId) {
      this.donationsService.getAllItems(this.donationId)?.subscribe(
        (response: any) => {
          this.items = response.data;
          this.dataSource = new MatTableDataSource<Item>(this.items);
        },
        (error) => {
          this.snackBar.open(`Error: ${error.message}`, 'Close', {
            duration: 5000,
          });
        }
      );
    }
  }

  navigateToCreateItem() {
    this.router.navigate([this.donationId, 'create-item']);
  }

  finalize() {
    this.router.navigate(['/benefactors']);
  }
}
