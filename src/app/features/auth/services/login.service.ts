import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ResponseDto } from 'src/app/core/models/responseDto';
import { LoginDto } from '../models/loginDto';
import { TokenDto } from '../models/tokenDto';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
    public redirectUrl:string;
    public fullName:string;
    public username:string;
    public role:string;

    constructor(
        @Inject("auth-apiUrl") private auth_apiUrl:string,
        private httpClient: HttpClient) { }
        jwtHelper: JwtHelperService = new JwtHelperService;
        login(request: LoginDto) {
            let api = this.auth_apiUrl+"Auth/CreateToken"
            return this.httpClient.post<ResponseDto<TokenDto>>(api, request)
        }
}
