import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app.layout.component';

const routerOptions: ExtraOptions = {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled',
};

const routes: Routes = [

    {
        path: '',
        redirectTo: 'main-map', // Boş path'te ana haritaya yönlendir
        pathMatch: 'full'
    },
    {
        path: '',
        component: AppLayoutComponent,
        children: [
            {
                path: 'main-map',
                loadChildren: () =>
                    import('./features/map-view/main-map/main-map.module').then(
                        (m) => m.MainMapModule
                    ),
            },
            {
                path: 'operator',
                loadChildren: () =>
                    import('./roles/operator/operator.module').then(
                        (m) => m.OperatorModule
                    ),
            },
            {
                path: 'info-pages',
                loadChildren: () =>
                    import('./features/info-pages/info-pages.module').then(m => m.InfoPagesModule)
            }
        ],
    },
    {
        path: 'auth',
        loadChildren: () =>
            import('./features/auth/auth.module').then(
                (m) => m.AuthModule
            ),
    },
    {
        path: 'notfound',
        loadChildren: () =>
            import('./features/notfound/notfound.module').then(
                (m) => m.NotfoundModule
            ),
    },
    {
        path: 'landing',
        loadChildren: () =>
            import('./features/landing/landing.module').then(
                (m) => m.LandingModule
            ),
    },
    { path: '**', redirectTo: '/notfound' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, routerOptions)],
    exports: [RouterModule],
})
export class AppRoutingModule { }
