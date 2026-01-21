import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StaticsService {

    constructor(private http: HttpClient) { }

    getCachedUrls() {
        return this.http.get<any>('assets/data/cachedUrls.json')
        .toPromise()
        .then(res => res.data as any[])
        .then(data => data);
    }
    getCurrencies() {
        return this.http.get<any>('assets/data/currencies.json')
          .toPromise()
          .then(res => res.data as any[])
          .then(data => data);
        }
}
