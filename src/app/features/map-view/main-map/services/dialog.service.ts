import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
/*
interface DialogState {
    wkt: boolean;
    coordinate: boolean;
}

interface MinimizeState {
    wkt: boolean;
    coordinate: boolean;
}*/

export type DialogType = 'wkt' | 'coordinate' | 'download';

interface DialogState {
    visible: boolean;
    minimized: boolean;
}

@Injectable({
    providedIn: 'root'
})

export class DialogService {
    /*
    private dialogState = new BehaviorSubject<DialogState>({ wkt: false, coordinate: false });
    dialogState$ = this.dialogState.asObservable();

    private minimizeState = new BehaviorSubject<MinimizeState>({ wkt: false, coordinate: false });
    minimizeState$ = this.minimizeState.asObservable();

    private downloadDialogState = new BehaviorSubject<boolean>(false);
    downloadDialogState$ = this.downloadDialogState.asObservable();

    showDialog(type: 'wkt' | 'coordinate') {
        const current = this.dialogState.value;
        this.dialogState.next({ ...current, [type]: true });

        const currentMinimize = this.minimizeState.value;
        this.minimizeState.next({ ...currentMinimize, [type]: false }); // sadece açılan dialog resetleniyor
    }

    hideDialog(type: 'wkt' | 'coordinate') {
        const current = this.dialogState.value;
        this.dialogState.next({ ...current, [type]: false });

        const currentMinimize = this.minimizeState.value;
        this.minimizeState.next({ ...currentMinimize, [type]: false }); // sadece kapanan dialog resetleniyor
    }

    toggleDialog(type: 'wkt' | 'coordinate') {
        const current = this.dialogState.value;
        const newState = { ...current, [type]: !current[type] };
        this.dialogState.next(newState);
    }

    toggleMinimize(type: 'wkt' | 'coordinate') {
        const current = this.minimizeState.value;
        this.minimizeState.next({ ...current, [type]: !current[type] });
    }

    showDownloadDialog() {
        this.downloadDialogState.next(true);
    }

    hideDownloadDialog() {
        this.downloadDialogState.next(false);
    }

    toggleDownloadDialog() {
        this.downloadDialogState.next(!this.downloadDialogState.value);
    }*/

    private dialogs: Record<DialogType, BehaviorSubject<DialogState>> = {
        wkt: new BehaviorSubject<DialogState>({ visible: false, minimized: false }),
        coordinate: new BehaviorSubject<DialogState>({ visible: false, minimized: false }),
        download: new BehaviorSubject<DialogState>({ visible: false, minimized: false })
    };

    // Observable olarak erişim
    getDialogState$(type: DialogType): Observable<DialogState> {
        return this.dialogs[type].asObservable();
    }


    getDialogState(type: DialogType): DialogState {
        return this.dialogs[type].value;
    }
    // Toggle görünürlük
    toggleDialog(type: DialogType) {
        const cur = this.dialogs[type].value;
        // Eğer şu anda visible ise kapatıyoruz ve minimized'ı resetliyoruz.
        if (cur.visible) {
            this.dialogs[type].next({ visible: false, minimized: false });
        } else {
            // Açılıyorsa visible true, minimized false (normal açılış boyutu)
            this.dialogs[type].next({ ...cur, visible: true, minimized: false });
        }
    }

    // Sadece göster
    showDialog(type: DialogType) {
        const cur = this.dialogs[type].value;
        this.dialogs[type].next({ ...cur, visible: true, minimized: false });
    }

    // Sadece gizle
    hideDialog(type: DialogType) {
        // Kapatırken minimized'ı resetle
        this.dialogs[type].next({ visible: false, minimized: false });
    }

    // Toggle minimize
    toggleMinimize(type: DialogType) {
        const current = this.dialogs[type].value;
        this.dialogs[type].next({ ...current, minimized: !current.minimized });
    }
}
