import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { MenuChangeEvent } from './api/menuchangeevent';

interface DialogState {
    visible: boolean;
    minimized: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class MenuService {

    private menuSource = new Subject<MenuChangeEvent>();
    private resetSource = new Subject();

    menuSource$ = this.menuSource.asObservable();
    resetSource$ = this.resetSource.asObservable();


    private dialogs: { [key: string]: DialogState } = {};   // Tüm dialogların durumu burada 

    private dialogsSubject = new BehaviorSubject<{ [key: string]: DialogState }>({});
    public dialogs$ = this.dialogsSubject.asObservable();

    private minimizedOrderSubject = new BehaviorSubject<string[]>([]);
    public minimizedOrder$ = this.minimizedOrderSubject.asObservable();


    onMenuStateChange(event: MenuChangeEvent) {
        this.menuSource.next(event);
        //this.setBasvuruMinimized(false); 
    }

    reset() {
        this.resetSource.next(true);
    }
    /*
    openBasvuruDialog() {
        //console.log('basvuru menu');
        this.basvuruDialogSubject.next(true);
        this.setBasvuruMinimized(false);
    }

    closeBasvuruDialog() {
        this.basvuruDialogSubject.next(false);
        this.setBasvuruMinimized(false); // kapanırken footer’daki kutu da kaybolsun
    }

    toggleBasvuruMinimized() {
        const current = this.basvuruMinimizedSubject.getValue();
        this.setBasvuruMinimized(!current);
    }

    setBasvuruMinimized(value: boolean) {
        this.basvuruMinimizedSubject.next(value);
    }

    openFenKayitDialog() {
        console.log('fenklasörü');
        this.fenKayitDialogSubject.next(true);
        this.setFenKayitMinimized(false);
    }

    closeFenKayitDialog() {
        this.fenKayitDialogSubject.next(false);
        this.setFenKayitMinimized(false); // kapanırken footer’daki kutu da kaybolsun
    }

    toggleFenKayitMinimized() {
        const current = this.fenKayitMinimizedSubject.getValue();
        this.setFenKayitMinimized(!current);
    }

    setFenKayitMinimized(value: boolean) {
        this.fenKayitMinimizedSubject.next(value);
    }
    */
    // Dialog aç
    openDialog(name: string) {
        if (!this.dialogs[name]) {
            this.dialogs[name] = { visible: true, minimized: false };
        } else {
            this.dialogs[name].visible = true;
            this.dialogs[name].minimized = false;
        }

        this.removeFromMinimizedOrder(name);
        this.updateDialogs();
    }

    private updateDialogs() {
        this.dialogsSubject.next({ ...this.dialogs });
    }

    closeDialog(name: string) {
        if (!this.dialogs[name]) return;
        this.dialogs[name].visible = false;
        this.dialogs[name].minimized = false;
        this.removeFromMinimizedOrder(name);
        this.updateDialogs();
    }

    toggleMinimized(name: string) {
        debugger;
        const dialog = this.dialogs[name];
        if (!dialog) return;

        dialog.minimized = !dialog.minimized;

        // Minimize sırasını güncelle
        if (dialog.minimized) {
            this.addToMinimizedOrder(name);
        } else {
            this.removeFromMinimizedOrder(name);
        }

        this.updateDialogs();
    }

    private addToMinimizedOrder(name: string) {
        const order = this.minimizedOrderSubject.getValue().filter(n => n !== name);
        order.push(name);
        this.minimizedOrderSubject.next(order);
    }

    private removeFromMinimizedOrder(name: string) {
        const order = this.minimizedOrderSubject.getValue().filter(n => n !== name);
        this.minimizedOrderSubject.next(order);
    }

    restoreDialog(name: string) {
        const dialog = this.dialogs[name];
        if (!dialog) return;

        dialog.minimized = false;
       // dialog.visible = true;
        this.removeFromMinimizedOrder(name);
        this.updateDialogs();
    }

    public getDialogState(name: string) {//: DialogState | undefined {
        return this.dialogs[name];
    }

}
