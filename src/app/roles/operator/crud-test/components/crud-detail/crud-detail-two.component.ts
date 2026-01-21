import { Component, Input } from '@angular/core';
import { CrudDto } from '../../models/crudDto';

@Component({
  selector: 'app-crud-detail-two',
  templateUrl: './crud-detail-two.component.html',
  styleUrl: './crud-detail-two.component.scss'
})
export class CrudDetailTwoComponent {
  @Input() crudDto: CrudDto | null = null;

}
