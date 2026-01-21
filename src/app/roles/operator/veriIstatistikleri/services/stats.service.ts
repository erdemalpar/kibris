import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDto } from 'src/app/core/models/responseDto';
import { IlceBasedIstatistikReqDto } from '../components/models/ilceBasedIstatistikReqDto';
import { ParcelStatisticByIlceDto } from '../components/models/parsel/parcelStatisticByIlceDto';
import { MahalleBasedIstatistikReqDto } from '../components/models/mahalleBasedIstatistikReqDto';
import { ParcelStatisticByMahalleDto } from '../components/models/parsel/parcelStatisticByMahalleDto';
import { MegsisUserIstatistikResDto } from '../components/models/MegsisUserIstatistikResDto';


@Injectable({
    providedIn: 'root'
})
export class StatsService {

    constructor(
        @Inject('megsisIstatistik-apiUrl') private apiUrl: string,
        private http: HttpClient
    ) { }

    /**
     * İlçe bazlı parsel istatistikleri
     */
    getParcelStatisticsByIlce(dto: IlceBasedIstatistikReqDto[]): Observable<ResponseDto<ParcelStatisticByIlceDto[]>> {
        const api = `${this.apiUrl}MegsisIstatistik/GetParcelStatisticByIlceAsync`;
        return this.http.post<ResponseDto<ParcelStatisticByIlceDto[]>>(api, dto, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        }
        );
    }

    /**
 * Mahalle bazlı parsel istatistikleri
 */
    getParcelStatisticsByMahalle(dto: MahalleBasedIstatistikReqDto[]): Observable<ResponseDto<ParcelStatisticByMahalleDto[]>> {
        const api = `${this.apiUrl}MegsisIstatistik/GetParcelStatisticByMahalleAsync`;
        return this.http.post<ResponseDto<ParcelStatisticByMahalleDto[]>>(api, dto, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        }
        );
    }

    /**
 * Admin bazlı parsel istatistikleri
 * (JWT + Admin yetkisi gerekir)
 */
    getParcelStatisticsByAdmin(): Observable<ResponseDto<MegsisUserIstatistikResDto[]>> {
        debugger;
        const api = `${this.apiUrl}MegsisIstatistik/GetParcelStatisticByAdminAsync`;
        return this.http.get<ResponseDto<MegsisUserIstatistikResDto[]>>(api);
    }

    /**
 * Kullanıcı bazlı parsel istatistikleri
 * (JWT zorunlu)
 */
    getParcelStatisticsByUser(): Observable<ResponseDto<MegsisUserIstatistikResDto[]>> {
        const api = `${this.apiUrl}MegsisIstatistik/GetParcelStatisticByUserAsync`;
        return this.http.get<ResponseDto<MegsisUserIstatistikResDto[]>>(api);
    }


}
