import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.scss']
})
export class VersionsComponent implements OnInit {

  constructor(
    public matDialogRef: MatDialogRef<VersionsComponent>
  ) {
  }

  ngOnInit(): void {
  }

}
