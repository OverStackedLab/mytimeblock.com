export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  description?: string;
  backgroundColor?: string;
  allDay?: boolean;
  userId?: string;
  color?: string;
};

export type EventState = {
  events: CalendarEvent[];
};

export type RootState = {
  events: EventState;
};
