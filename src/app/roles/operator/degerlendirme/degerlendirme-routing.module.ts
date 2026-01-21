import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DegerlendirmeComponent } from './components/degerlendirme.component';




@NgModule({
    imports: [
        RouterModule.forChild([
            { path: '', component: DegerlendirmeComponent }
        ]),
    ],
    exports: [RouterModule]
})
export class DegerlendirmeRoutingModule { }
