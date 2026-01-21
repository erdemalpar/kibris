import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core';
import { PathLocationStrategy, LocationStrategy, registerLocaleData } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppLayoutModule } from './layout/app.layout.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthInterceptor } from './core/interceptor/auth.interceptor';
import { CacheInterceptor } from './core/interceptor/cache.interceptor';
import localeEnUS from "@angular/common/locales/en";
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


registerLocaleData(localeEnUS, "en-US");

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
        HttpClientModule,
        CommonModule,
         BrowserAnimationsModule
    ],
    providers: [
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        ConfirmationService,MessageService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
        { provide: LOCALE_ID, useValue: "en-US" },
        
        { provide: 'auth-apiUrl', useValue: 'http://localhost:6200/auth-gate/' },
        { provide: 'cadastralData-apiUrl', useValue: 'http://localhost:6200/cadastraldata-gate/' },
        { provide: 'gmlServiceData-apiUrl', useValue: 'http://localhost:6200/gmlservice-gate/' },
        { provide: 'spatialDataProvider-apiUrl', useValue: 'http://localhost:6200/spatialdataprovider-gate/' },
        { provide: 'administrative-apiUrl', useValue: 'http://localhost:6200/spatialdataprovider-gate/' },
        { provide: 'parcel-query-apiUrl', useValue: 'http://localhost:6200/spatialdataprovider-gate/' },
        { provide: 'degerlendirmeGmlServiceData-apiUrl', useValue: 'http://localhost:6200/degerlendirmegmlservice-gate/' },
        { provide: 'degerlendirmeBaseLayer-apiUrl', useValue: 'http://localhost:6200/degerlendirmedata-gate/' },
        { provide: 'degerlendirmeDataTable-apiUrl', useValue: 'http://localhost:6200/degerlendirmedata-gate/' },
        { provide: 'megsisIstatistik-apiUrl', useValue: 'http://localhost:6200/megsisistatistikservice-gate/' },


        //{ provide: 'auth-apiUrl', useValue: 'https://megsisgateway.tapu.gov.ct.tr/auth-gate/' },
        //{ provide: 'cadastralData-apiUrl', useValue: 'https://megsisgateway.tapu.gov.ct.tr/cadastraldata-gate/' },
        //{ provide: 'gmlServiceData-apiUrl', useValue: 'https://megsisgateway.tapu.gov.ct.tr/gmlservice-gate/' },
        //{ provide: 'spatialDataProvider-apiUrl', useValue: 'https://megsisgateway.tapu.gov.ct.tr/spatialdataprovider-gate/' },
        //{ provide: 'administrative-apiUrl', useValue: 'https://megsisgateway.tapu.gov.ct.tr/spatialdataprovider-gate/' },
        //{ provide: 'parcel-query-apiUrl', useValue: 'https://megsisgateway.tapu.gov.ct.tr/spatialdataprovider-gate/' },
        //{ provide: 'degerlendirmeGmlServiceData-apiUrl', useValue: 'https://megsisgateway.tapu.gov.ct.tr/degerlendirmegmlservice-gate/' },
        //{ provide: 'degerlendirmeBaseLayer-apiUrl', useValue: 'https://megsisgateway.tapu.gov.ct.tr/degerlendirmedata-gate/' },
        //{ provide: 'degerlendirmeDataTable-apiUrl', useValue: 'https://megsisgateway.tapu.gov.ct.tr/degerlendirmedata-gate/' },
        //{ provide: 'megsisIstatistik-apiUrl', useValue: 'https://megsisgateway.tapu.gov.ct.tr/megsisistatistikservice-gate/' },
        
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class AppModule { }
