import { Event } from "@store";

export interface CardContentProps {
  event: Event;
  isPriority?: boolean;
  isHorizontal?: boolean;
}

export interface MemoizedValues {
  title: string;
  location: string;
  subLocation: string;
  image: string;
  eventDate: string;
}
