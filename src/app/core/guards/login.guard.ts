import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanDeactivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthorizationService } from '../services/authorizationService.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate, CanActivateChild, CanDeactivate<unknown>, CanLoad {
    constructor(
        private authService:AuthorizationService,
        private router:Router
    ){

    }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        if (this.authService.isAuthenticatedForLocalStorage()) {
            if(route && route.data && route.data["roles"]?.includes(this.authService.getRole())){
                return true;
            }
            else
            {
                this.router.navigate(["notfound"]);
                return false;
            }
          }
          else{
            this.router.navigate(["login"],{queryParams: {returnUrl:state.url}});
            this.authService.redirectUrl = state.url;
            return false;
          }
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        if (this.authService.isAuthenticatedForLocalStorage()) {
            if(childRoute && childRoute.data && childRoute.data["roles"]?.includes(this.authService.getRole())){
                return true;
            }
            else
            {
                this.router.navigate(["notfound"]);
                return false;
            }
          }
          else{
            this.router.navigate(["login"],{queryParams: {returnUrl:state.url}});
            this.authService.redirectUrl = state.url;
            return false;
          }
  }
  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        if (this.authService.isAuthenticatedForLocalStorage()) {
            if(route && route.data && route.data["roles"]?.includes(this.authService.getRole())){
                return true;
            }
            else
            {
                this.router.navigate(["notfound"]);
                return false;
            }
          }
          else{
            this.router.navigate(["notfound"]);
            return false;
          }
  }
}
