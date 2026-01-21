import { Component, Input, OnInit } from '@angular/core';
import { CrudDto } from '../../models/crudDto';

@Component({
  selector: 'app-crud-detail',
  templateUrl: './crud-detail.component.html',
  styleUrl: './crud-detail.component.scss'
})
export class CrudDetailComponent implements OnInit{
  @Input() crudDto: CrudDto | null = null;
  active1 = 0;
  ngOnInit(): void {

  }
}
