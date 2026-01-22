import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from 'src/app/layout/app.layout.component';
import { OzelalanlarComponent } from './ozelalanlar/ozelalanlar.component';


const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'crud-test',
                loadChildren: () =>
                    import('./crud-test/crud.module').then(
                        (m) => m.CrudModule
                    ),
            },
            {
                path: 'gml-factory',
                loadChildren: () =>
                    import('./gml-factory/gml-factory.module').then(
                        (m) => m.GmlModule
                    ),
            },
            {
                path: 'veriIstatistikleri',
                loadChildren: () =>
                    import('./veriIstatistikleri/dashboard.module').then(
                        (m) => m.DashboardModule
                    ),
            },
            {
                path: 'degerlendirme',
                loadChildren: () =>
                    import('./degerlendirme/degerlendirme.module').then(
                        (m) => m.DegerlendirmeModule
                    ),
            },
            {
                path: 'main-map',
                loadChildren: () =>
                    import('../../features/map-view/main-map/main-map.module').then(
                        (m) => m.MainMapModule
                    ),
            },
            {
                path: 'ozelalanlar',
                component: OzelalanlarComponent
            }
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OperatorRoutingModule { }

