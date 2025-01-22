export type CalendarEvent = {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  backgroundColor?: string;
  allDay?: boolean;
  color?: string;
  extendedProps?: {
    description?: string;
  };
};

export type CalendarState = {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
};

export type EventState = {
  events: CalendarEvent[];
};

export type RootState = {
  events: EventState;
};
