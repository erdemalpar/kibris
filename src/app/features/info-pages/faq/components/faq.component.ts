import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface FAQ {
    title: string;
    content: string;
}

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
    faqs: FAQ[] = [];

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.loadFaqs();
    }

    loadFaqs(): void {
        this.http.get<FAQ[]>('assets/data/faqs.json').subscribe({
            next: (data) => (this.faqs = data),
            error: (err) => console.error('SSS yüklenirken hata oluştu:', err)
        });
    }
}
