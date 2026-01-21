import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component';
import { DownloadComponent } from './components/download/download.component';



@NgModule({
    imports: [
        RouterModule.forChild([
            { path: 'upload', component: UploadComponent },
            { path: 'download', component: DownloadComponent },
            { path: '', redirectTo: 'upload', pathMatch: 'full' } // opsiyonel default
        ]),
    ],
    exports: [RouterModule]
})
export class GmlFactoryRoutingModule { }
