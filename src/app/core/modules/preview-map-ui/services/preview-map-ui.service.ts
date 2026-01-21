import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDto } from 'src/app/core/models/responseDto';
import { PreviewMapUIComponent } from '../models/PreviewMapUIDto';

@Injectable({
    providedIn: 'root'
})
export class PreviewMapUiService {

    constructor(
        @Inject("gmlServiceData-apiUrl") private apiUrl: string,
        private httpClient: HttpClient) { }
    /**
     * @param gmlUploadDto
     * @returns
     */
    UploadGmlContent(dto: PreviewMapUIComponent): Observable<ResponseDto<PreviewMapUIComponent>> {
        const api = `${this.apiUrl}GmlService/GetGmlContentAsStringAsync`;
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.httpClient.post<ResponseDto<PreviewMapUIComponent>>(api, dto, { headers });
    }

}
