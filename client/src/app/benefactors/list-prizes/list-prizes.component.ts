import { Component } from '@angular/core';
import {Prize} from "../../models/prize";
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {BenefactorsService} from "../../services/benefactors.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {CreatePrizeComponent} from "../create-prize/create-prize.component";
import {EditPrizeComponent} from "../edit-prize/edit-prize.component";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatButton} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-list-prizes',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatButton,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatIconModule
  ],
  templateUrl: './list-prizes.component.html',
  styleUrl: './list-prizes.component.css'
})
export class ListPrizesComponent {
  prizes: Prize[] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<Prize>(this.prizes);
  displayedColumns: string[] = ['title', 'description', 'price'];
  benefactorId?: string;

  constructor(
    private service: BenefactorsService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.benefactorId = params.get('id') || '';
    });
    this.getPrizes();
  }

  getPrizes() {
    if (this.benefactorId) {
      this.service.getBenefactorPrizes(this.benefactorId)
        ?.subscribe(
          (prizes: Prize[]) => {
            console.log(prizes, this.benefactorId);
            this.prizes = prizes;
          },
          (error) => {
            this.snackBar.open('Erro loading pickpoints', 'Close', {
              duration: 3000
            });
          }
        );
    }
  }

  addPrize() {
    const dialogRef = this.dialog.open(CreatePrizeComponent, {
      data: {
        benefactorId: this.benefactorId,
      },
      width: '35vw',
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getPrizes();
    });
  }

  editPrize(prize: Prize) {
    const dialogRef = this.dialog.open(EditPrizeComponent, {
      data: {
        benefactorId: this.benefactorId,
        prize: prize,
      },
      width: '35vw',
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getPrizes();
    });
  }
}
