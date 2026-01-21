import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ResponseDto, ResponseListDto } from 'src/app/core/models/responseDto';
import { Observable, throwError } from 'rxjs';
import { shareReplay, catchError } from 'rxjs/operators';
import { SpatialDataResponseDto } from '../models/spatialDataResponseDto';


@Injectable({
  providedIn: 'root'
})
export class AdministrativeQueryService {

    constructor(
        @Inject("administrative-apiUrl") private apiUrl:string,
        private httpClient: HttpClient) { }
    private ilceList$: Observable<ResponseListDto<SpatialDataResponseDto>> | null = null;
    private katmanList$: Observable<ResponseListDto<SpatialDataResponseDto>> | null = null;
        /*
        getIlceList(){
            let api = this.apiUrl+"AdministrativeUnit/IlceList"
           return this.httpClient.get<ResponseListDto<IlceDto>>(api)
            //return this.httpClient.get<ResponseListDto<string>>(api)
    }*/

    getIlceList(): Observable<ResponseListDto<SpatialDataResponseDto>> {
        if (!this.ilceList$) {
            const api = this.apiUrl + "AdministrativeRegion/GetIlceResDtoAsync";
            this.ilceList$ = this.httpClient.get<ResponseListDto<SpatialDataResponseDto>>(api).pipe(
                shareReplay(1), // cache’ler ve paylaşır
                catchError(err => {
                    this.ilceList$ = null; // hata olursa cache’i sıfırla
                    return throwError(() => err);
                })
            );
        }

        return this.ilceList$;
    }
     
    getMahalleList(ilceId: number) {
        const api = this.apiUrl + "AdministrativeRegion/GetMahalleListResDtoByIlceIdAsync";
        return this.httpClient.post<ResponseListDto<SpatialDataResponseDto>>(api, { id: ilceId, name: "" });
    }

    getAdaList(mahalleId: number) {
        const api = this.apiUrl + "AdministrativeRegion/GetAdaListResDtoByMahalleIdAsync";
        return this.httpClient.post<ResponseListDto<SpatialDataResponseDto>>(api, { id: mahalleId, name: "" });
    }

    getParselList(mahalleId: number, adaNo:string) {
        const api = this.apiUrl + "AdministrativeRegion/GetParcelListResDtoByMahalleIdAsync";
        return this.httpClient.post<ResponseListDto<SpatialDataResponseDto>>(api, { id: mahalleId, name:adaNo });
    }

    getKatmanList(): Observable<ResponseListDto<SpatialDataResponseDto>> {
        if (!this.katmanList$) {
            const api = this.apiUrl + "BaseLayer/GetAllLayerTypeResDtoList";
            this.katmanList$ = this.httpClient.get<ResponseListDto<SpatialDataResponseDto>>(api).pipe(
                shareReplay(1), // cache’ler ve paylaşır
                catchError(err => {
                    this.katmanList$ = null; // hata olursa cache’i sıfırla
                    return throwError(() => err);
                })
            );
        }

        return this.katmanList$;
    }

    getIlceGeom(ilceId: number) {
        let api = this.apiUrl + "AdministrativeRegion/GetIlceGeom?ilceId=" + ilceId;
        return this.httpClient.get<ResponseDto<string>>(api)
    }
    getMahalleGeom(mahalleId:number) {
        let api = this.apiUrl + "AdministrativeUnit/GetMahalleGeom?mahalleId=" + mahalleId;
        return this.httpClient.get<ResponseDto<string>>(api)
    }
}
export interface getParcelWithMahalleAdaParselQuery {
    mahalleId: number;
    adaNo: string;
    parselNo: string;
}
