export interface Calendar {
    id: string;
    name: string;
    description: string;
    timeZone: string;
    color: string;
    events?: Array<CalendarEvent>;
    default?: boolean;
}

export interface CalendarEvent {
    id: string;
    subject: string;
    location: string;
    startTime: Date;
    endTime: Date;
    categoryColor: string;
    city: string;
    eventType: string;
    allDay: boolean;
    recurrenceRule: string;
    imageName: string;
}
