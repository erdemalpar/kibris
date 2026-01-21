import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ErrorDto } from '../models/errorDto';
import { ResponseDto } from '../models/responseDto';

@Injectable({
  providedIn: 'root'
})
export class CustomMessageService {
    static displayErrorMessageString(arg0: string) {
      throw new Error('Method not implemented.');
    }
    static displayInfoMessage(arg0: string) {
      throw new Error('Method not implemented.');
    }

    constructor(
        private messageService: MessageService
    ) { }

    displayErrorMessage(httpErrorResponse: HttpErrorResponse) {
        if (httpErrorResponse.status == 403) {
            this.messageService.add(
                { key: 'notification', severity: 'error', summary: 'Hata', detail: ("Bu işlemi yapmaya yetkiniz yok.") }
            );
        }

        else {
            let responseDto: ResponseDto<ErrorDto> = httpErrorResponse.error;
            let errorDto: ErrorDto = httpErrorResponse.error;
            if (responseDto.error != null) {
                let errorDto: ErrorDto = responseDto.error
                if (errorDto.errors.length == 1) {
                    this.messageService.add(
                        { key: 'notification', severity: 'error', summary: 'Hata', detail: (errorDto.errors[0]) }
                    );
                }
                else if (errorDto.errors.length > 1) {
                    let result = '';
                    errorDto.errors.forEach(element => {
                        result += element + '\n';
                    })
                    this.messageService.add({ key: 'notification', severity: 'error', summary: 'Hata', detail: result });
                }
            }
            else if (errorDto.errors != null) {
                if (errorDto.errors.length == 1) {
                    this.messageService.add(
                        { key: 'notification', severity: 'error', summary: 'Hata', detail: (errorDto.errors[0]) }
                    );
                }
                else if (errorDto.errors.length > 1) {
                    let result = '';
                    errorDto.errors.forEach(element => {
                        result += element + '\n';
                    })
                    this.messageService.add({ key: 'notification', severity: 'error', summary: 'Hata', detail: result });
                }
            }
            else {
                this.messageService.add({ key: 'notification', severity: 'error', summary: 'Hata', detail: 'ResponseDto olmayan hata geldi' });
            }
        }

    }
    displayErrorMessageString(detail: string) {
        this.messageService.add(
            { key: 'notification', severity: 'error', summary: 'Hata', detail: detail }
        );
    }
    displayInfoMessage(detail: string) {
        this.messageService.add(
            { key: 'notification', severity: 'success', summary: 'Bilgi', detail: detail }
        );
    }
    displayWarningMessage(detail: string) {
        this.messageService.add(
            { key: 'notification', severity: 'warn', summary: 'Uyarı', detail: detail }
        );
    }
   
}
