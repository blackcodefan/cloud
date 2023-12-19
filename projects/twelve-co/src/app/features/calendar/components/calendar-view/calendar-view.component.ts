import { AfterViewChecked, Component, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { DropDownList } from '@syncfusion/ej2-angular-dropdowns';
import { BeforeOpenCloseMenuEventArgs, ContextMenuComponent, MenuEventArgs, MenuItemModel } from '@syncfusion/ej2-angular-navigations';
import {
    AgendaService,
    CellClickEventArgs,
    DayService,
    EventSettingsModel,
    ExcelExportService,
    FieldModel,
    ICalendarExportService,
    MonthService,
    PopupOpenEventArgs,
    PrintService,
    ScheduleComponent,
    TimelineMonthService,
    TimelineViewsService,
    TimelineYearService,
    WeekService,
    WorkWeekService,
    YearService,
} from '@syncfusion/ej2-angular-schedule';
import { closest, createElement, extend, isNullOrUndefined, remove, removeClass } from '@syncfusion/ej2-base';
import { DataManager, Query } from '@syncfusion/ej2-data';
import { BusEventEnum, EventBusService, LoaderService } from 'core-lib';
import { SubSink } from 'subsink';
import { Calendar, CalendarEvent } from '../../model';
import { CalendarService } from '../../serices/calendar.service';
import { addCalendar, CalendarState, selectSelectedCalendar, setCalendars } from '../../store';
import { CreateCalendarComponent } from '../modals/create-calendar/create-calendar.component';

declare var moment: any;

@Component({
    selector: 'app-calendar-view',
    templateUrl: './calendar-view.component.html',
    styleUrls: [ './calendar-view.component.scss' ],
    providers: [ DayService, WeekService, WorkWeekService, MonthService, YearService, AgendaService,
        TimelineViewsService, TimelineMonthService, TimelineYearService, PrintService, ExcelExportService, ICalendarExportService ],
    encapsulation: ViewEncapsulation.None,
})
export class CalendarViewComponent implements OnInit, AfterViewChecked, OnDestroy {
    @ViewChild('parent') parent;
    @ViewChild('scheduleObj') public scheduleObj: ScheduleComponent;
    @ViewChild('menuObj') public menuObj: ContextMenuComponent;
    allowResizing = true;
    allowDragDrop = true;
    selectedDate: Date = new Date();
    eventSettings: EventSettingsModel = { dataSource: extend([], [], undefined, true) as Record<string, any>[], fields: this.configureFieldsForCalendar() };
    selectedTarget: Element;
    subsink = new SubSink();
    menuItems: MenuItemModel[] = [
        { text: 'New Event', iconCss: 'e-icons e-plus', id: 'Add' },
        { text: 'New Recurring Event', iconCss: 'e-icons e-repeat', id: 'AddRecurrence' },
        { text: 'Today', iconCss: 'e-icons e-timeline-today', id: 'Today' },
        { text: 'Edit Event', iconCss: 'e-icons e-edit', id: 'Save' },
        {
            text: 'Edit Event', id: 'EditRecurrenceEvent', iconCss: 'e-icons e-edit',
            items: [
                { text: 'Edit Occurrence', id: 'EditOccurrence' },
                { text: 'Edit Series', id: 'EditSeries' },
            ],
        },
        { text: 'Delete Event', iconCss: 'e-icons e-trash', id: 'Delete' },
        {
            text: 'Delete Event', id: 'DeleteRecurrenceEvent', iconCss: 'e-icons e-trash',
            items: [
                { text: 'Delete Occurrence', id: 'DeleteOccurrence' },
                { text: 'Delete Series', id: 'DeleteSeries' },
            ],
        },
    ];
    private initialized = false;
    private selectedCalendarId: string | null;

    constructor(private renderer: Renderer2, private calendarService: CalendarService, private matSnack: MatSnackBar, private matDialog: MatDialog,
                private loader: LoaderService, private store: Store<CalendarState>, private eventBus: EventBusService) {
    }

    ngOnInit(): void {
        this.subsink.sink = this.calendarService.getCalendarsMin().subscribe(res => {
            this.store.dispatch(setCalendars({ calendars: res }));
        });
        this.subsink.sink = this.store.pipe(select(selectSelectedCalendar)).subscribe(calId => {
            this.selectedCalendarId = calId;
            this.fetchCalendarById(calId);
        });
        this.subsink.sink = this.eventBus.on(BusEventEnum.CALENDAR_SINGLE_FILE_UPLOAD, (calendarFile) => this.handleUploadCalendarFile(calendarFile));
        this.subsink.sink = this.eventBus.on(BusEventEnum.CREATE_CALENDAR, () => this.handleCreateCalendar());
    }


    ngOnDestroy() {
        this.subsink.unsubscribe();
    }

    ngAfterViewChecked() {
        if (this.parent) {
            const height = `${ this.parent.nativeElement.height - 100 }px`;
        }
    }

    public onContextMenuBeforeOpen(args: BeforeOpenCloseMenuEventArgs): void {
        const newEventElement: HTMLElement = document.querySelector('.e-new-event') as HTMLElement;
        if (newEventElement) {
            remove(newEventElement);
            removeClass([ document.querySelector('.e-selected-cell') as Element ], 'e-selected-cell');
        }
        const targetElement: HTMLElement = args.event.target as HTMLElement;
        if (closest(targetElement, '.e-contextmenu')) {
            return;
        }
        this.selectedTarget = closest(targetElement, '.e-appointment,.e-work-cells,' +
            '.e-vertical-view .e-date-header-wrap .e-all-day-cells,.e-vertical-view .e-date-header-wrap .e-header-cells');
        if (isNullOrUndefined(this.selectedTarget)) {
            args.cancel = true;
            return;
        }
        if (this.selectedTarget.classList.contains('e-appointment')) {
            const eventObj: Record<string, any> = this.scheduleObj.getEventDetails(this.selectedTarget) as Record<string, any>;
            if (eventObj.RecurrenceRule) {
                this.menuObj.showItems([ 'EditRecurrenceEvent', 'DeleteRecurrenceEvent' ], true);
                this.menuObj.hideItems([ 'Add', 'AddRecurrence', 'Today', 'Save', 'Delete' ], true);
            } else {
                this.menuObj.showItems([ 'Save', 'Delete' ], true);
                this.menuObj.hideItems([ 'Add', 'AddRecurrence', 'Today', 'EditRecurrenceEvent', 'DeleteRecurrenceEvent' ], true);
            }
            return;
        }
        this.menuObj.hideItems([ 'Save', 'Delete', 'EditRecurrenceEvent', 'DeleteRecurrenceEvent' ], true);
        this.menuObj.showItems([ 'Add', 'AddRecurrence', 'Today' ], true);
    }

    public onMenuItemSelect(args: MenuEventArgs): void {
        // @ts-ignore
        const selectedMenuItem: string = args.item.id;
        let eventObj: Record<string, any>;
        if (this.selectedTarget.classList.contains('e-appointment')) {
            eventObj = this.scheduleObj.getEventDetails(this.selectedTarget) as Record<string, any>;
        }
        switch (selectedMenuItem) {
            case 'Today':
                this.scheduleObj.selectedDate = new Date();
                break;
            case 'Add':
            case 'AddRecurrence':
                const selectedCells: Element[] = this.scheduleObj.getSelectedElements();
                const activeCellsData: CellClickEventArgs =
                    this.scheduleObj.getCellDetails(selectedCells.length > 0 ? selectedCells : this.selectedTarget);
                if (selectedMenuItem === 'Add') {
                    this.scheduleObj.openEditor(activeCellsData, 'Add');
                } else {
                    this.scheduleObj.openEditor(activeCellsData, 'Add', undefined, 1);
                }
                break;
            case 'Save':
            case 'EditOccurrence':
            case 'EditSeries':
                if (selectedMenuItem === 'EditSeries') {
                    // tslint:disable-next-line:max-line-length
                    // @ts-ignore
                    const query = new Query().where(this.scheduleObj.eventFields.id, 'equal', eventObj[this.scheduleObj.eventFields.recurrenceID] as string | number);
                    eventObj = (new DataManager(this.scheduleObj.eventsData).executeLocal(query)[0] as Record<string, any>);
                }
                // @ts-ignore
                this.scheduleObj.openEditor(eventObj, selectedMenuItem);
                break;
            case 'Delete':// @ts-ignore
                this.scheduleObj.deleteEvent(eventObj);
                break;
            case 'DeleteOccurrence':
            case 'DeleteSeries':// @ts-ignore
                this.scheduleObj.deleteEvent(eventObj, selectedMenuItem);
                break;
        }
        // @ts-ignore
    }


    handleChange(event: any) {
        if (!this.initialized) {
            return;
        }
        switch (event.requestType) {
            case 'eventCreated':
                console.log('event created ->>');
                const createEvent = event.data as Array<CalendarEvent>;
                console.debug(createEvent);
                if (createEvent.length > 0) {
                    this.calendarService.saveCalendarEvent(createEvent[0]).subscribe(res => {
                        console.log('event saved successfully');
                    }, error => {
                        this.matSnack.open('error saving event');
                    });
                }
                console.info('----');
                break;
            case 'eventChanged':
                console.log('event changed');
                const changeEvent = event.data as Array<CalendarEvent>;
                console.debug(changeEvent);
                if (changeEvent.length > 0) {
                    this.calendarService.editCalendarEvent(changeEvent[0]).subscribe(res => {
                        console.log('event saved successfully');
                    }, error => {
                        this.matSnack.open('error saving event');
                    });
                }
                console.info('----');
                break;
            case 'eventRemoved':
                console.log('event changed');
                const removeEvent = event.data as Array<CalendarEvent>;
                console.debug(removeEvent);
                if (removeEvent.length > 0) {
                    this.calendarService.removeCalendarEvent(removeEvent[0]).subscribe(res => {
                        console.log('event saved successfully');
                    }, error => {
                        this.matSnack.open('error saving event');
                    });
                }
                console.info('----');
                break;
            default:
                break;
        }
    }

    handleUploadCalendarFile(file: File) {
        console.log('uploading');
        this.loader.showLoader();
        this.calendarService.uploadIcalFile(file).subscribe((res: Calendar) => {
                this.addCalendarWithNewEvents([ res ]);
                this.matSnack.open('Calendar file uploaded ');
                this.loader.hideLoader();
            }, error => {
                this.matSnack.open('Error uploading calendar file');
                console.error('error uploading calendar file');
                this.loader.hideLoader();
            },
        );
    }


    onPopupOpen(args: PopupOpenEventArgs): void {
        if (args.type === 'Editor') {
            // Create required custom elements in initial time
            if (!args.element.querySelector('.custom-field-row')) {
                let row: HTMLElement = createElement('div', { className: 'custom-field-row' });
                // @ts-ignore
                let formElement: HTMLElement = args.element.querySelector('.e-schedule-form');
                // @ts-ignore
                formElement.lastChild.appendChild(row, args.element.querySelector('.e-title-location-row'));
                let container: HTMLElement = createElement('div', { className: 'custom-field-container' });
                let inputEle: HTMLInputElement = createElement('input', {
                    className: 'e-field', attrs: { name: 'EventType' },
                }) as HTMLInputElement;
                container.appendChild(inputEle);
                row.appendChild(container);
                let dropDownList: DropDownList = new DropDownList({
                    dataSource: [
                        { text: 'Public Event', value: 'public-event' },
                        { text: 'Maintenance', value: 'maintenance' },
                        { text: 'Commercial Event', value: 'commercial-event' },
                        { text: 'Family Event', value: 'family-event' },
                    ],
                    fields: { text: 'text', value: 'value' },
                    value: (<{ [key: string]: Object }> (args.data)).EventType as string,
                    floatLabelType: 'Always', placeholder: 'Event Type',
                });
                dropDownList.appendTo(inputEle);
                inputEle.setAttribute('name', 'EventType');
            }
        }
    }


    /**
     * Fetch calendar by id
     * @param calId
     * @private
     */
    private fetchCalendarById(calId) {
        this.loader.showLoader();
        this.subsink.sink = this.calendarService.fetchCalendar(calId).subscribe((res: Array<Calendar>) => {
            console.log('adding events: ', res);
            this.addCalendarWithNewEvents(res);
            this.loader.hideLoader();
            console.debug(this.scheduleObj);
        }, error => {
            this.loader.hideLoader();
            this.matSnack.open('Error fetching calendar');
        });
    }

    private addCalendarWithNewEvents(res: Array<Calendar>) {
        this.initialized = false;
        res.forEach(cal => {
            this.store.dispatch(addCalendar({ calendar: cal }));
            if (cal.events) {
                cal.events.forEach(ev => {
                    const eev = Object.assign({}, ev, { endTime: new Date(ev.endTime) || new Date(), startTime: new Date(ev.startTime) });
                    this.scheduleObj.addEvent(eev);
                });
            }
        });
        this.initialized = true;
    }

    private configureFieldsForCalendar(): FieldModel {
        return {
            id: 'id',
            subject: {
                name: 'subject',
                default: '',
                title: '',
                validation: undefined,
            },
            startTime: {
                name: 'startTime',
                default: undefined,
                title: 'bazinga',
                validation: undefined,
            },
            // ts-ignore
            endTime: {
                name: 'endTime',
                default: undefined,
                title: undefined,
                validation: undefined,
            },/*
            startTimezone: {
                name: '',
                default: '',
                title: '',
                validation: undefined,
            },*/
            location: {
                name: 'location',
            },
            description: {
                name: 'description',
            },
            // recurrenceID: {
            //     name: '',
            //     default: '',
            //     title: '',
            //     validation: undefined,
            // },
            recurrenceRule: {
                name: 'recurrenceRule',
                default: '',
            },
            isAllDay: {
                name: 'allDay',

            },
            // followingID: undefined,

            /**
             allDay: false
             categoryColor: null
             city: null
             endTime: 1648605600000
             eventType: null
             id: "d46ae98f-3e97-46cf-bd66-8be355744e01"
             imageName: null
             location: "Capital One Arena - Washington, DC"
             recurrenceRule: null
             startTime: 1648594800000
             subject: "Chicago Bulls @ Washington Wizards"
             */
        };
    }

    private handleCreateCalendar() {
        this.matDialog.open(CreateCalendarComponent);
    }
}
