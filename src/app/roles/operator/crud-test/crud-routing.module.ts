import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CrudListComponent } from './components/crud-list.component';



@NgModule({
    imports: [
        RouterModule.forChild([
             {path: '', component: CrudListComponent},
            // {path: 'payment-confirm', component: BalancePaymentConfirmComponent},
        ])
    ],
    exports: [RouterModule]
})
export class CrudRoutingModule { }
