// features/info-pages/info-pages.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoPagesRoutingModule } from './info-pages-routing.module';
import { FaqModule } from './faq/faq.module';

@NgModule({
    imports: [
        CommonModule,
        InfoPagesRoutingModule,
        FaqModule
    ]
})
export class InfoPagesModule { }
