import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDto } from 'src/app/core/models/responseDto';
import { TkmGmlUploadDto } from '../models/tkmGmlUploadDto';
import { TkmGmlUploadPreviewMapDto } from 'src/app/core/modules/preview-map-ui/models/tkmGmlUploadPreviewMapDto';
import { TkmGmlDownloadDto } from '../models/tkmGmlDownloadDto';

@Injectable({
    providedIn: 'root'
})
export class GmlDownloadService {

    constructor(
        @Inject("gmlServiceData-apiUrl") private apiUrl: string,
        private httpClient: HttpClient) { }
    /**
     * @param gmlDownloadDto
     * @returns
     */

    DownloadGml(dtoList: TkmGmlDownloadDto[]): Observable<Blob> {
        const api = `${this.apiUrl}GmlService/TkmGmlDownload`;

        return this.httpClient.post(api, dtoList, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            responseType: 'blob'
        });
    }

}
