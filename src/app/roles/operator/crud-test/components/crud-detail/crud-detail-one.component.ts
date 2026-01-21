import { Component, Input } from '@angular/core';
import { CrudDto } from '../../models/crudDto';

@Component({
  selector: 'app-crud-detail-one',
  templateUrl: './crud-detail-one.component.html',
  styleUrl: './crud-detail-one.component.scss'
})
export class CrudDetailOneComponent {
  @Input() crudDto: CrudDto | null = null;

}
