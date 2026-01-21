// features/info-pages/info-pages-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaqComponent } from './faq/components/faq.component';

const routes: Routes = [
    { path: 'faq', component: FaqComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InfoPagesRoutingModule { }
