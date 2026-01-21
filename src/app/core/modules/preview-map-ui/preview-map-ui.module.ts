import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

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
import { CustomSpinnerModule } from 'src/app/core/modules/custom-spinner/custom-spinner.module';
import { PreviewMapUIComponent } from 'src/app/core/modules/preview-map-ui/components/preview-map-ui.component';




@NgModule({
  declarations: [
    PreviewMapUIComponent
  ],
  imports: [
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
    CustomSpinnerModule,
    DialogModule
  ],
  exports: [
    PreviewMapUIComponent
  ]
})
export class PreviewMapUIModule { }
