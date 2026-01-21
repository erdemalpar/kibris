import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MainMapComponent } from './main-map.component';

@NgModule({
    imports: [
        RouterModule.forChild([{ path: '', component: MainMapComponent }]),
    ],
    exports: [RouterModule],
})
export class MainMapRoutingModule {}
