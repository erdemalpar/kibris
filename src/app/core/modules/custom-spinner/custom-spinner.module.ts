import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { CustomSpinnerComponent } from './components/custom-spinner.component';



@NgModule({
  declarations: [CustomSpinnerComponent],
  imports: [
    CommonModule
  ],
  exports:[CustomSpinnerComponent,SharedModule]
})
export class CustomSpinnerModule { }
