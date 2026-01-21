import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MenuModule } from 'primeng/menu';
import { SplitButtonModule } from 'primeng/splitbutton';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { DividerModule } from 'primeng/divider';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { CrudRoutingModule } from './crud-routing.module';
import { CrudListComponent } from './components/crud-list.component';
import { CrudEditComponent } from './components/crud-edit.component';
import { CrudDetailComponent } from './components/crud-detail/crud-detail.component';
import { CrudTypesPipe } from './pipes/crud-types';
import { CustomSpinnerModule } from 'src/app/core/modules/custom-spinner/custom-spinner.module';
import { CrudDetailOneComponent } from './components/crud-detail/crud-detail-one.component';
import { CrudDetailTwoComponent } from './components/crud-detail/crud-detail-two.component';



@NgModule({
  declarations: [
    CrudTypesPipe,
    CrudDetailOneComponent,
    CrudDetailTwoComponent,
    CrudDetailComponent,
    CrudListComponent,
    CrudEditComponent
  ],
  imports: [
    CrudRoutingModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    TabViewModule,
    InputTextModule,
    InputTextareaModule,
    ReactiveFormsModule,
    OverlayPanelModule,
    TableModule,
    ToastModule,
    TagModule,
    InputSwitchModule,
    MenuModule,
    SplitButtonModule,
    DropdownModule,
    FileUploadModule,
    CheckboxModule,
    DialogModule,
    DividerModule,
    RadioButtonModule,
    FileUploadModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    ConfirmDialogModule,
    InputMaskModule,
    CustomSpinnerModule

  ]
})
export class CrudModule { }
