import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StaticsService } from '../services/statics.service';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

    private requests: any = { };

    constructor(private cachedUrlsService:StaticsService) { }
    cachedUrlList:any[];
    getCachedUrls(){
      if(!this.cachedUrlList){
          this.cachedUrlsService.getCachedUrls().then(cachedUrls => {
              this.cachedUrlList = cachedUrls;
              return this.cachedUrlList;
          });
      }
      else{
          return this.cachedUrlList;
      }
      return [];

    }

    get(url: string): HttpResponse<unknown> | undefined {
      return this.requests[url];
    }

    put(url: string, response: HttpResponse<unknown>): void {
      if(this.getCachedUrls().filter(x=>url.includes(x.name)).length>0){
          this.requests[url] = response;
      }
    }


    invalidateUrl(url: string): void {
      this.requests[url] =undefined;
      // this.requests.forEach(element => {
      //     if(url.indexOf(element)>0)
      //         this.requests[url] = undefined;
      // });
    }

    invalidateCache(): void {
      this.requests = { };
    }

  }
