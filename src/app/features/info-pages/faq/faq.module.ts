import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { FaqComponent } from './components/faq.component';

@NgModule({
    declarations: [FaqComponent],
    imports: [
        CommonModule,
        AccordionModule
    ],
    exports: [FaqComponent]
})
export class FaqModule { }
