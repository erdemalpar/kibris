import { Component } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { LoginService } from '../services/login.service';
import { LoginDto } from '../models/loginDto';
import { Router } from '@angular/router';
import { CustomMessageService } from 'src/app/core/services/custom-message.service';
import { AuthorizationService } from 'src/app/core/services/authorizationService.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    templateUrl: './login.component.html',
})
export class LoginComponent {
    rememberMe: boolean = false;
    loading = false;
    loginDto:LoginDto={
        username:'',
        password:''
    };
    constructor(private layoutService: LayoutService,
        private loginService: LoginService,
        private router:Router,
        private authorizationService:AuthorizationService,
        private customMessageService:CustomMessageService,
    ) {}

    get dark(): boolean {
        return this.layoutService.config().colorScheme !== 'light';
    }
    signIn(){
        this.loading=true;
        this.loginService.login(this.loginDto).subscribe((res) => {
            if (this.authorizationService.redirectUrl) {
                this.router.navigate([this.authorizationService.redirectUrl])
              }
              else{
                this.router.navigate(["/main-map"])
              }
            //this.customMessageService.displayInfoMessage(res.data.accessToken)
           // this.customMessageService.displayInfoMessage('Giriş Başarılı');
            localStorage.setItem("accessToken",res.data.accessToken)
            localStorage.setItem("accessTokenExpiration",res.data.accessTokenExpiration)
            localStorage.setItem("refreshToken",res.data.refreshToken)
            localStorage.setItem("refreshTokenExpiration",res.data.refreshTokenExpiration)
            this.authorizationService.getCodes();

            this.loading = false;
        },(error:HttpErrorResponse)=>{
            this.customMessageService.displayErrorMessage(error);
            this.loading = false;
        });
    }
}
