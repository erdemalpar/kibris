import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainMapRoutingModule } from './main-map-routing.module';
import { MainMapComponent } from './main-map.component';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
//import { MapToolsComponent } from '../map-tools/map-tools.component';
import { MapToolbarComponent } from './map-toolbar.component';
import { CoordinateComponent } from '../main-map/coordinate/coordinate.component';
import { WktComponent } from '../main-map/wkt/wkt.component';
import { BasvuruComponent } from 'src/app/features/basvuru/basvuru.component';
import { DownloadComponent } from 'src/app/roles/operator/gml-factory/components/download/download.component';

import { MultiSelectModule } from 'primeng/multiselect';
import { CardModule } from 'primeng/card';
import { ParcelIdentifyComponent } from 'src/app/features/map-view/main-map/parcel-identify-result/components/parcel-identify.component';
import { PaginatorModule } from 'primeng/paginator';
import { SplitterModule } from 'primeng/splitter';
import { ToolbarModule } from 'primeng/toolbar';
import { FenkayitComponent } from 'src/app/roles/operator/fenkayit/fenkayit.component';

@NgModule({
    imports: [
        CommonModule,
        MainMapRoutingModule,
        ButtonModule,
        ProgressBarModule,
        TableModule,
        ChartModule,
        DropdownModule,
        InputTextareaModule,
        InputTextModule,
        FormsModule,
        TagModule,
        RatingModule,
        MenuModule,
        DialogModule,
        MultiSelectModule,
        CardModule,
        CardModule,
        PaginatorModule,
        SplitterModule,
        ToolbarModule
    ],
    declarations: [MainMapComponent, MapToolbarComponent, CoordinateComponent, WktComponent, BasvuruComponent, DownloadComponent, ParcelIdentifyComponent, FenkayitComponent],
})
export class MainMapModule { }
