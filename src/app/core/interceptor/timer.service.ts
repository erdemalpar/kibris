import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
    private isTimerStarted = false;
    public dateNow = new Date();
    public dDay = new Date();
    milliSecondsInASecond = 1000;
    hoursInADay = 24;
    minutesInAnHour = 60;
    SecondsInAMinute = 60;

    public timeDifference: any;

    constructor() {}

    private getTimeDifference() {
      this.timeDifference = this.dDay.getTime() - new Date().getTime();
    }

    startTimer() {
      if (!this.isTimerStarted) {

        this.dDay.setMinutes(
          this.dDay.getMinutes() + 30 //+environment.cacheTimeInMinutes // you can put this time in environment file to make it configurable.
        );
        this.getTimeDifference();
        this.isTimerStarted = true;
      }
    }

    resetTimer() {
      this.isTimerStarted = false;
      this.getTimeDifference();
    }

    getRemainingTime(): number {
      this.getTimeDifference();
      return this.timeDifference;
    }
  }
