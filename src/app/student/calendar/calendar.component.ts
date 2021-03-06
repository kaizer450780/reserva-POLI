import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { CalendarEvent } from 'angular-calendar';
import { DayViewHour } from 'calendar-utils';
import { addDays, addHours, startOfDay } from 'date-fns';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  @Input() events: CalendarEvent[];

  @Input() tipoPrestamo: String;

  @Input() cantidad;

  @Input() cantidadTotal;

  @Output() bookingChange = new EventEmitter();

  activeDayIsOpen: boolean;
  selectedDayViewDate: Date;
  actionDelete = [
    {
      label: '<span style="font-size:20px"><b>&times; </b></span>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        const reservas = [];
        this.events.forEach(element => {
          if (element.color === colors.blue) {
            reservas.push({ start: element.start, end: element.end });
          }
        });
        this.bookingChange.emit(JSON.stringify(reservas));
        this.cont = 0;
      }
    }
  ];
  cont = 0;
  mensaje = '';

  // Calendario
  viewDate: Date = new Date();
  view = 'month';
  refresh: Subject<any> = new Subject();


  constructor() {

  }

  ngOnInit() {
  }

  hourSegmentClicked(date: Date) {
    if (this.tipoPrestamo === 'Implements') {
      this.implementos(date);
    } else {
      this.escenarios(date);
    }
    this.refresh.next();
  }

  escenarios(date) {
    this.selectedDayViewDate = date;
    const startDate = date;
    const endDate = date;
    this.mensaje = '';
    if (this.cont === 0) {
      const hoy = new Date();
      if (startDate < hoy) {
        this.mensaje = 'La fecha inicial ya ha pasado.';
      } else {
        this.events.forEach(element => {
          if (startDate <= element.end && startDate >= element.start) {
            this.mensaje = 'La fecha ya está reservada.';
          }
        });
        if (this.mensaje === '') {
          this.events.push({
            start: startDate,
            end: startDate,
            title: 'Reserva desde: \n' + startDate.toLocaleDateString('es', options),
            color: colors.blue,
            actions: this.actionDelete
          });
          this.cont++;
        }
      }
    } else if (this.cont === 1) {
      endDate.setMinutes(date.getMinutes() + 30);
      if (this.events[this.events.length - 1].start === endDate) {
        this.mensaje = 'Las fechas no pueden ser iguales.';
      } else if (this.events[this.events.length - 1].start > endDate) {
        this.mensaje = 'La fecha inicial es mayor a la fecha final.';
      } else {
        this.events.forEach(element => {
          if (endDate <= element.end && endDate >= element.start) {
            this.mensaje = 'La fecha ya está reservada.';
          }
        });
        if (this.mensaje === '') {
          this.events[this.events.length - 1].title += ' hasta ' + endDate.toLocaleDateString('es', options);
          this.events[this.events.length - 1].end = endDate;
          this.cont++;
          const reservas = [];
          this.events.forEach(element => {
            if (element.color === colors.blue) {
              reservas.push({
                start: `${element.start.getFullYear()}-${element.start.getMonth() + 1}-${element.start.getDate()} ${element.start.getHours()}:${element.start.getMinutes()}:${element.start.getSeconds()}`,
                end: `${element.end.getFullYear()}-${element.end.getMonth() + 1}-${element.end.getDate()} ${element.end.getHours()}:${element.end.getMinutes()}:${element.end.getSeconds()}`
              });
            }
          });
          this.bookingChange.emit(JSON.stringify(reservas));
          this.cont = 0;
        }
      }
    }
  }

  implementos(date) {
    this.selectedDayViewDate = date;
    const startDate = date;
    const endDate = date;
    this.mensaje = '';
    const hoy = new Date();
    if (this.cont === 0) {
      if (startDate < hoy) {
        this.mensaje = 'La fecha inicial ya ha pasado.';
      } else {
        const contador = { cont: 0 };
        this.events.forEach(element => {
          if (startDate <= element.end && startDate >= element.start) {
            contador.cont++;
          }
        });
        if (this.cantidad > (this.cantidadTotal - contador.cont)) {
          this.mensaje = 'La cantidad requerida ya está reservada para esta fecha.';
        } else {
          if (this.mensaje === '') {
            this.events.push({
              start: startDate,
              end: startDate,
              title: 'Reserva desde: \n' + startDate.toLocaleDateString('es', options),
              color: colors.blue,
              actions: this.actionDelete
            });
            this.cont++;
          }
        }
      }
    } else if (this.cont === 1) {
      endDate.setMinutes(date.getMinutes() + 30);
      if (this.events[this.events.length - 1].start === endDate) {
        this.mensaje = 'Las fechas no pueden ser iguales.';
      } else if (this.events[this.events.length - 1].start > endDate) {
        this.mensaje = 'La fecha inicial es mayor a la fecha final.';
      } else {
        const contador = { cont: 0 };
        this.events.forEach(element => {
          if (endDate <= element.end && endDate >= element.start) {
            contador.cont++;
          }
        });
        if (this.cantidad > (this.cantidadTotal - contador.cont)) {
          this.mensaje = 'La cantidad requerida ya está reservada para esta fecha.';
        } else {
          if (this.mensaje === '') {
            this.events[this.events.length - 1].title += ' hasta ' + endDate.toLocaleDateString('es', options);
            this.events[this.events.length - 1].end = endDate;
            const reservas = [];
            this.events.forEach(element => {
              if (element.color === colors.blue) {
                reservas.push({
                  start: `${element.start.getFullYear()}-${element.start.getMonth() + 1}-${element.start.getDate()} ${element.start.getHours()}:${element.start.getMinutes()}:${element.start.getSeconds()}`,
                  end: `${element.end.getFullYear()}-${element.end.getMonth() + 1}-${element.end.getDate()} ${element.end.getHours()}:${element.end.getMinutes()}:${element.end.getSeconds()}`
                });
              }
            });
            this.bookingChange.emit(JSON.stringify(reservas));
            this.cont = 0;
          }
        }
      }
    }
  }

}
