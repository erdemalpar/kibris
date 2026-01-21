import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { LatLng } from 'leaflet';
import { ResponseDto } from 'src/app/core/models/responseDto';
import { ParcelInfoDto } from 'src/app/core/models/parcelInfoDto';

@Injectable({
    providedIn: 'root'
})
export class IdentifyService {
    constructor(
        @Inject('parcel-query-apiUrl') private apiUrl: string,
        private httpClient: HttpClient
    ) { }

    getParcelInfoByCoordinate(lat: number, lng: number): Observable<ResponseDto<ParcelInfoDto>> {
        const url = `${this.apiUrl}AdministrativeRegion/GetParcelInfoByGeomAsync`;
        const body = { latitude: lat, longitude: lng };
        return this.httpClient.post<ResponseDto<ParcelInfoDto>>(url, body);
    }

}
