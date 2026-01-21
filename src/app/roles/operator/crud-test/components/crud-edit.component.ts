import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrudDto } from '../models/crudDto';
import { CrudService } from '../services/crud-service';
import { CustomMessageService } from 'src/app/core/services/custom-message.service';
import { IdValueDto } from 'src/app/core/models/idValueDto';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-crud-edit',
  templateUrl: './crud-edit.component.html',
  styleUrls: ['./crud-edit.component.scss']
})
export class CrudEditComponent implements OnInit, OnChanges {
  @Input() crudDto: CrudDto | null = null;
  @Output() onSave = new EventEmitter<CrudDto>();
  @Output() onCancel = new EventEmitter<void>();

  myForm!: FormGroup;
  crudTypes: IdValueDto[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private service: CrudService,
    private customMessageService: CustomMessageService,
  ) {}

  ngOnInit(): void {
   
    this.loadCrudTypes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.myForm = this.fb.group({
      crudType: [null, Validators.required],
      description: ['', Validators.required]
    });
    if (changes['crudDto']?.currentValue && this.crudTypes?.length > 0) {
      const matched = this.crudTypes.find(c => c.value === this.crudDto?.crudType);
      this.myForm.patchValue({
        crudType: matched?.id ?? null,
        description: this.crudDto?.description || ''
      });
    }
    else
    {
      this.myForm.patchValue({
        crudType: null,
        description: ''
      });
    }
  }

  private loadCrudTypes(): void {
    this.service.getCrudTypes().subscribe({
      next: data => this.crudTypes = data.data,
      error: (err: HttpErrorResponse) => this.customMessageService.displayErrorMessage(err)
    });
  }

  onSubmitClick(): void {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      this.customMessageService.displayErrorMessageString('Eksik bilgileri doldurunuz');
      return;
    }

    this.loading = true;
    const dto: CrudDto = { ...this.crudDto, ...this.myForm.value } as CrudDto;

    const request = dto.id
      ? this.service.updateAsync(dto)
      : this.service.addAsync(dto);

    request.subscribe({
      next: res => {
        this.onSave.emit(res.data);
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.customMessageService.displayErrorMessage(err);
        this.loading = false;
      }
    });
  }

  onCancelClick(): void {
    this.onCancel.emit();
  }
}
