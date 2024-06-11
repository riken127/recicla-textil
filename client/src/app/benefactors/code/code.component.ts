import { Component, Inject } from '@angular/core';
import { OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-code',
  standalone: true,
  imports: [
    MatButtonModule
  ],
  templateUrl: './code.component.html',
  styleUrl: './code.component.css'
})
export class CodeComponent implements OnInit{
  code?: string;

  constructor( 
    private dialogRef: MatDialogRef<CodeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { code: string}
  ) {
    this.code = data.code;
  }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
