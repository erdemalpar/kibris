import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDto } from 'src/app/core/models/responseDto';
import { ResponseListWithCountDto } from 'src/app/core/models/responseDto';
import { SpatialDataResponseDto } from '../../gml-factory/models/spatialDataResponseDto';
import { TkmDegerlendirmeGmlUploadDto } from '../components/models/tkmDegerlendirmeGmlUploadDto';
import { TkmGmlUploadPreviewMapDto } from 'src/app/core/modules/preview-map-ui/models/tkmGmlUploadPreviewMapDto';
import { TkmDegerlendirmeGmlApprovedResDto } from '../components/models/TkmDegerlendirmeGmlApprovedResDto';
import { DegerlendirmeAlanDto } from '../components/models/degerlendirmeAlanDto';
import { shareReplay } from 'rxjs/operators';
import { of } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class GmlDegerlendirmeUploadService {

    constructor(
        @Inject("degerlendirmeGmlServiceData-apiUrl") private apiUrl: string,
        @Inject("spatialDataProvider-apiUrl") private spatialDataProviderApiUrl: string,
        @Inject("degerlendirmeBaseLayer-apiUrl") private degerlendirmeBaseLAyerApiUrl: string,
        @Inject("degerlendirmeDataTable-apiUrl") private degerlendirmeDataTableApiUrl: string,
        private httpClient: HttpClient) { }
    /**
     * @param gmlUploadDto
     * @returns
     */

    private ticariCache$!: Observable<ResponseDto<any[]>>;
    private konutCache$!: Observable<ResponseDto<any[]>>;
    private araziCache$!: Observable<ResponseDto<any[]>>;


    GetIlceler(): Observable<ResponseDto<SpatialDataResponseDto[]>> {
        const api = `${this.spatialDataProviderApiUrl}AdministrativeRegion/GetIlceResDtoAsync`;
        return this.httpClient.get<ResponseDto<SpatialDataResponseDto[]>>(api);
    }

    GetMahalleler(ilceId: number): Observable<ResponseDto<SpatialDataResponseDto[]>> {
        const api = `${this.spatialDataProviderApiUrl}AdministrativeRegion/GetMahalleListResDtoByIlceIdAsync`;
        const dto = { id: ilceId };
        return this.httpClient.post<ResponseDto<SpatialDataResponseDto[]>>(api, dto, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        });
    }

    UploadDegerlendirmeGmlContent(dto: TkmDegerlendirmeGmlUploadDto): Observable<ResponseDto<any>> {
        debugger;
        const api = `${this.apiUrl}DegerlendirmeGmlService/TkmDegerlendirmeGmlUpload`;
        return this.httpClient.post<ResponseDto<any>>(api, dto, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        });
    }
    /*
    GetValuationTypeOfTicariAlan(): Observable<ResponseDto<any[]>> {
        const api = `${this.degerlendirmeBaseLAyerApiUrl}DegerlendirmeBaseLayer/GetValuationTypeOfTicariAlan`;
        return this.httpClient.get<ResponseDto<any[]>>(api);
    }

    GetValuationTypeOfKonutAlan(): Observable<ResponseDto<any[]>> {
        const api = `${this.degerlendirmeBaseLAyerApiUrl}DegerlendirmeBaseLayer/GetValuationTypeOfKonutAlan`;
        return this.httpClient.get<ResponseDto<any[]>>(api);
    }

    GetValuationTypeOfAraziAlan(): Observable<ResponseDto<any[]>> {
        const api = `${this.degerlendirmeBaseLAyerApiUrl}DegerlendirmeBaseLayer/GetValuationTypeOfAraziAlan`;
        return this.httpClient.get<ResponseDto<any[]>>(api);
    }*/

    GetValuationTypeOfTicariAlan(): Observable<ResponseDto<any[]>> {
        if (!this.ticariCache$) {
            const api = `${this.degerlendirmeBaseLAyerApiUrl}DegerlendirmeBaseLayer/GetValuationTypeOfTicariAlan`;
            this.ticariCache$ = this.httpClient.get<ResponseDto<any[]>>(api).pipe(
                shareReplay(1)
            );
        }
        return this.ticariCache$;
    }

    GetValuationTypeOfKonutAlan(): Observable<ResponseDto<any[]>> {
        if (!this.konutCache$) {
            const api = `${this.degerlendirmeBaseLAyerApiUrl}DegerlendirmeBaseLayer/GetValuationTypeOfKonutAlan`;
            this.konutCache$ = this.httpClient.get<ResponseDto<any[]>>(api).pipe(
                shareReplay(1)
            );
        }
        return this.konutCache$;
    }

    GetValuationTypeOfAraziAlan(): Observable<ResponseDto<any[]>> {
        if (!this.araziCache$) {
            const api = `${this.degerlendirmeBaseLAyerApiUrl}DegerlendirmeBaseLayer/GetValuationTypeOfAraziAlan`;
            this.araziCache$ = this.httpClient.get<ResponseDto<any[]>>(api).pipe(
                shareReplay(1)
            );
        }
        return this.araziCache$;
    }
    /*
    SaveGmlContent(listDto: TkmDegerlendirmeGmlApprovedResDto[]): Observable<ResponseDto<any>> {
        const api = `${this.apiUrl}DegerlendirmeGmlService/TkmDegerlendirmeGmlToApproved`;
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.httpClient.post<ResponseDto<any>>(api, listDto, { headers });
    }*/

    SaveGmlContent(listDto: TkmDegerlendirmeGmlApprovedResDto[]): Observable<string> {
        const api = `${this.apiUrl}DegerlendirmeGmlService/TkmDegerlendirmeGmlToApproved`;
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.httpClient.post(api, listDto, { headers, responseType: 'text' });
    }

    /*
    ListDegerlendirme(mahalleId: number): Observable<ResponseDto<any>> {
        const api = `${this.degerlendirmeDataTableApiUrl}DegerlendirmeDataTable/GetAllByMahalleId?id=${mahalleId}`;
        return this.httpClient.post<ResponseDto<any>>(api, {});
    }*/

    ListDegerlendirme(dto: DegerlendirmeAlanDto): Observable<ResponseListWithCountDto<any>> {
        const api = `${this.degerlendirmeDataTableApiUrl}DegerlendirmeDataTable/GetAllByMahalleId`;
        return this.httpClient.post<ResponseListWithCountDto<any>>(api, dto);
    }

}
