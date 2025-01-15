export type EventInfo = Event & {
  id?: string;
  description?: string;
  color?: string;
  userId?: string;
  start?: Date;
  end?: Date;
  allDay?: boolean;
  title?: string;
};
