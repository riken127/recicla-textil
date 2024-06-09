import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { BenefactorsService } from '../../services/benefactors.service';
import { Benefactor } from '../../models/benefactor';
import { Pickpoint } from '../../models/pickpoint';
import { ActivatedRoute, Router } from '@angular/router';
import { format } from 'date-fns';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { CreatePickpointComponent } from '../create-pickpoint/create-pickpoint.component';
import { MatDialog } from '@angular/material/dialog';
import { EditPickpointComponent } from '../edit-pickpoint/edit-pickpoint.component';

@Component({
  selector: 'app-list-pickpoints',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
  ],
  templateUrl: './list-pickpoints.component.html',
  styleUrl: './list-pickpoints.component.css'
})
export class ListPickpointsComponent {
  pickpoints: Pickpoint[] = [];
  dataSource = new MatTableDataSource<Pickpoint>(this.pickpoints);
  displayedColumns: string[] = ['name', 'address', 'actions'];
  benefactorId?: string;

  constructor(
    private service: BenefactorsService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.benefactorId = '' + params.get('id') || '';
    });
    this.getPickpoints();
  }

  getPickpoints() {
    if (this.benefactorId) {
    this.service.getAllPickpoints(this.benefactorId)?.subscribe(
      (pickpoints: Pickpoint[]) => {
        this.pickpoints = pickpoints;
      },
      (error) => {
        this.snackBar.open('Error loading pickpoints', 'Close', {
          duration: 2000,
        });
      }
    );
  }
  }

  addPickpoint() {
    const dialogRef = this.dialog.open(CreatePickpointComponent, {
      data: {
        benefactorId: this.benefactorId,
      },
      width: '35vw',
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getPickpoints();
    });
  }

  editPickpoint(pickpoint: Pickpoint) {
    const dialogRef = this.dialog.open(EditPickpointComponent, {
      data: {
        benefactorId: this.benefactorId,
        pickpoint: pickpoint,
      },
      width: '35vw',
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getPickpoints();
    });

  }
}
