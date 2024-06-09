import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { DonationsService } from '../../services/donations.service';
import { Item } from '../../models/item';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateItemComponent } from '../create-item/create-item.component';
import { MatDialog } from '@angular/material/dialog';
import { EditItemComponent } from '../edit-item/edit-item.component';

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
    CreateItemComponent,
    EditItemComponent,
  ],
  templateUrl: './list-items.component.html',
  styleUrl: './list-items.component.css',
})
export class ListItemsComponent implements OnInit {
  items: Item[] = [];
  dataSource = new MatTableDataSource<Item>(this.items);
  displayedColumns: string[] = ['brand', 'weight', 'size', 'type', 'actions'];
  donationId: string | null = null;

  constructor(
    private snackBar: MatSnackBar,
    private donationsService: DonationsService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {}

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
    const dialogRef = this.dialog.open(CreateItemComponent, {
      data: {
        donationId: this.donationId,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      this.getItems();
    });
  }

  navigateToEditItem(item: Item) {
    const dialogRef = this.dialog.open(EditItemComponent, {
      data: {
        item: item,
        donationId: this.donationId,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getItems();
    });
  }

  finalize() {
    this.router.navigate(['/user-profile']);
  }
}
