import { Event } from "react-big-calendar";

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  backgroundColor?: string;
  allDay?: boolean;
  categoryId?: string;
  extendedProps?: {
    description?: string;
  };
};

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type CategoryState = {
  categories: Category[];
  loading: boolean;
  error: string | null;
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

export type EventInfo = Event & {
  id?: string;
  description?: string;
  color?: string;
  userId?: string;
  start?: Date | string;
  end?: Date | string;
};
