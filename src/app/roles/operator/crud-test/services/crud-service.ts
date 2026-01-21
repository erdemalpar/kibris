import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDto, ResponseListDto, ResponseListWithCountDto } from 'src/app/core/models/responseDto';
import { NoDataDto } from 'src/app/core/models/noDataDto';
import { IdValueDto } from 'src/app/core/models/idValueDto';
import { CrudDto } from '../models/crudDto';
import { CrudQueryDto } from '../models/crudQueryDto';
import { CrudDeleteDto } from '../models/crudDeleteDto';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

    constructor(
        @Inject("cadastralData-apiUrl") private apiUrl:string,
        private httpClient: HttpClient) { }
/**
 * Yeni bir Crud kaydı oluşturur.
 * @param crudDto
 * @returns
 */
    addAsync(crudDto: CrudDto): Observable<ResponseDto<CrudDto>> {
        let api = this.apiUrl + "Crud/AddAsync";
        return this.httpClient.post<ResponseDto<CrudDto>>(api, crudDto);
    }
/**
 * Mevcut bir Crud kaydını günceller
 */
  updateAsync(crudDto: CrudDto): Observable<ResponseDto<CrudDto>> {
    const url = this.apiUrl + "Crud/UpdateAsync";
    return this.httpClient.post<ResponseDto<CrudDto>>(url, crudDto);
  }

  /**
   * Belirli bir Crud kaydını siler
   */
  deleteAsync(crudDeleteDto: CrudDeleteDto): Observable<ResponseDto<NoDataDto>> {
    const url = this.apiUrl + "Crud/DeleteAsync";
    return this.httpClient.post<ResponseDto<NoDataDto>>(url, crudDeleteDto);
  }

  /**
   * Belirli bir Crud kaydını getirir.
   */
  getByIdAsync(id: number): Observable<ResponseDto<CrudDto>> {
    const url = this.apiUrl + "Crud/GetByIdAsync?id=${id}";
    return this.httpClient.get<ResponseDto<CrudDto>>(url);
  }

  /**
   * Sorguya göre Crud listesi getirir.
   */
  getByQueryAsync(query:CrudQueryDto): Observable<ResponseListWithCountDto<CrudDto>> {
    const url = this.apiUrl + "Crud/GetByQueryAsync";
    return this.httpClient.post<ResponseListWithCountDto<CrudDto>>(url,query);
  }

  getCrudTypes(): Observable<ResponseListDto<IdValueDto>> {
    const url = this.apiUrl + "Crud/GetCrudTypesAsync";
    return this.httpClient.get<ResponseListDto<IdValueDto>>(url);
  } 
}
