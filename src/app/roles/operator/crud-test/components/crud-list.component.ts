import { Component, OnInit } from '@angular/core';
import { CrudQueryDto } from '../models/crudQueryDto';
import { CustomMessageService } from 'src/app/core/services/custom-message.service';
import { CrudService } from '../services/crud-service';
import { ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { CrudDto } from '../models/crudDto';
import { HttpErrorResponse } from '@angular/common/http';
import { IdValueDto } from 'src/app/core/models/idValueDto';
import { TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-crud-list',
  templateUrl: './crud-list.component.html',
  styleUrl: './crud-list.component.scss'
})
export class CrudListComponent implements OnInit {
  loading: boolean = false;
  query: CrudQueryDto = {};
  constructor(
    private customMessageService: CustomMessageService,
    private crudService: CrudService,
    private confirmationService: ConfirmationService
  ) {

  }
  init: boolean = false;
  ngOnInit(): void {
    this.getCrudTypesAsync();
    this.init= true;
  }

  loadLazy(event: TableLazyLoadEvent) {
    this.query.limit = event.rows;
    this.query.offset = event.first;
    this.query.sortFilter = Array.isArray(event.sortField)
      ? event.sortField[0]
      : event.sortField;
    this.query.sortOrderFilter = event.sortOrder;
    if (this.init) {
      this.loadCrudList();
    }
  }
  crudDtoList: CrudDto[];
  totalRecords: number;

  loadCrudList() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.crudService.getByQueryAsync(this.query).subscribe((res) => {
        this.crudDtoList = res.data;
        this.totalRecords = res.totalCount
        this.loading = false;
        resolve(res);
      }, (error: HttpErrorResponse) => {
        this.customMessageService.displayErrorMessage(error);
        this.loading = false;
      })
    });
  }
  crudTypes: IdValueDto[] = [];
  getCrudTypesAsync() {
    this.crudService.getCrudTypes().subscribe({
      next: (data) => {
        this.crudTypes = data.data;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.customMessageService.displayErrorMessage(error);
        this.loading = false;
      }
    });
  }
  crudFormDisplay: boolean = false;
  selectedCrud: CrudDto;
  createOrUpdateCrud(obj?: CrudDto): void {
    this.selectedCrud = obj ? { ...obj } : null;
    this.crudFormDisplay = true;
  }
  onSave(crudDto: CrudDto): void {
    this.loadCrudList();
    this.crudFormDisplay = false;
  }

  onCancel(): void {
    this.crudFormDisplay = false;
    this.selectedCrud = null;
  }

  deleteConfirmationDiaglogShow: boolean = false;
  confirmDelete(crudDto: CrudDto) {
        this.selectedCrud = crudDto;
        if (this.selectedCrud.isActive)
            this.deleteConfirmationDiaglogShow = true;
    }

  deleteCrud(): void {
    this.crudService.deleteAsync({ id: this.selectedCrud.id, deleteDescription: "Silindi" }).subscribe({
      next: () => {
        this.customMessageService.displayInfoMessage('İçerik Silindi');
        this.deleteConfirmationDiaglogShow = false;
        this.loadCrudList();
      },
      error: (error: HttpErrorResponse) => {
        this.customMessageService.displayErrorMessage(error);
      }
    });
  }
}
