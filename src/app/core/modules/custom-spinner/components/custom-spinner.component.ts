import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { SharedModule } from 'primeng/api';


@Component({
  selector: 'app-custom-spinner',
  templateUrl: './custom-spinner.component.html',
  styleUrls: ['./custom-spinner.component.scss']
})
export class CustomSpinnerComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

  }
