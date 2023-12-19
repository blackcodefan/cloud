import { Component, OnInit } from '@angular/core';
import { DomService } from 'core-lib';

@Component({
  selector: 'app-home-agile',
  templateUrl: './home-agile.component.html',
  styleUrls: ['./home-agile.component.scss']
})
export class HomeAgileComponent implements OnInit {

  constructor(private domService:DomService) { }

  ngOnInit(): void {
  }

}
