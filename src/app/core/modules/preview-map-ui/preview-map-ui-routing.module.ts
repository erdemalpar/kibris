import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PreviewMapUIComponent } from 'src/app/core/modules/preview-map-ui/components/preview-map-ui.component';



@NgModule({
    imports: [
        RouterModule.forChild([
             {path: '', component: PreviewMapUIComponent},
        ])
    ],
    exports: [RouterModule]
})
export class PreviewMapUiRoutingModule { }
