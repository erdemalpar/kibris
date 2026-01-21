import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDto } from 'src/app/core/models/responseDto';
import { SpatialDataResponseDto } from '../models/spatialDataResponseDto';
import { TkmGmlUploadDto } from '../models/tkmGmlUploadDto';
import { TkmGmlUploadPreviewMapDto } from 'src/app/core/modules/preview-map-ui/models/tkmGmlUploadPreviewMapDto';

@Injectable({
    providedIn: 'root'
})
export class GmlUploadService {

    constructor(
        @Inject("gmlServiceData-apiUrl") private apiUrl: string,
        @Inject("spatialDataProvider-apiUrl") private spatialDataProviderApiUrl: string,
        private httpClient: HttpClient) { }
    /**
     * @param gmlUploadDto
     * @returns
     */


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

    UploadGmlContent(dto: TkmGmlUploadDto): Observable<ResponseDto<any>> {
        debugger;
        const api = `${this.apiUrl}GmlService/TkmGmlUpload`;
        return this.httpClient.post<ResponseDto<any>>(api, dto, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        });
    }

    SaveGmlContent(dto: TkmGmlUploadPreviewMapDto): Observable<ResponseDto<TkmGmlUploadPreviewMapDto>> {
        const api = `${this.apiUrl}GmlService/TkmGmlToApproved`;
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.httpClient.post<ResponseDto<TkmGmlUploadPreviewMapDto>>(api, dto, { headers });
    }

    ErrorGmlDownload(dto: TkmGmlUploadPreviewMapDto): Observable<Blob> {
        debugger;
        const api = `${this.apiUrl}GmlService/TkmErrorGmlDownload`;
        return this.httpClient.post(api, dto, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
              responseType: 'blob'
        });
    }

}
