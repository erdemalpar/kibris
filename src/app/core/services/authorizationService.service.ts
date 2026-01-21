import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { JwtHelperService } from "@auth0/angular-jwt";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  public redirectUrl: string;
  public fullName: string;
  public username: string;
  public role: string;

  constructor(
    @Inject("auth-apiUrl") private apiUrl: string,
      private httpClient: HttpClient, private router: Router) { }
  jwtHelper: JwtHelperService = new JwtHelperService;

  isAuthenticatedForLocalStorage() {
    if (localStorage.getItem("accessToken")) {
      return true;
    }
    else {
      return false;
    }
  }
  getRole() {
    if (this.isAuthenticatedForLocalStorage()) {
      let token = localStorage.getItem("accessToken");
      let decode = this.jwtHelper.decodeToken(token);
      let role = Object.keys(decode).filter(x => x.endsWith("/role"))[0];
      return decode[role];
    }
  }
  isRefreshTokenExpire() {
    let expirationTime = localStorage.getItem("accessTokenExpiration");
    var now = new Date();
    if (expirationTime == undefined || now > new Date(expirationTime))
      return true;
    else
      return false;
  }
  getCodes() {
    if (this.isAuthenticatedForLocalStorage()) {
      let token = localStorage.getItem("accessToken");
      let decode = this.jwtHelper.decodeToken(token);
      let role = Object.keys(decode).filter(x => x.endsWith("/role"))[0];
      this.role = decode[role];
      let fullName = Object.keys(decode).filter(x => x.endsWith("fullName"))[0];
      this.fullName = decode[fullName];
      let username = Object.keys(decode).filter(x => x.endsWith("/name"))[0];
      this.username = decode[username];
    }
    }


    logout() {
        // localStorage'daki tüm token ve user bilgilerini temizle
        localStorage.removeItem('accessToken');
        localStorage.removeItem('accessTokenExpiration');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('refreshTokenExpiration');
        localStorage.removeItem('role');
        localStorage.removeItem('username');

        // login sayfasına yönlendir
        this.router.navigate(['/auth/login']);
    }

}
