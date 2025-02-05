import { RefObject } from "react";
import { EventDetailResponseDTO } from "types/api/event";

export interface EventData extends EventDetailResponseDTO {
  // Computed fields that we add to the base DTO
  mapsLocation?: string;
  timeUntil?: string;
  nameDay?: string;
  formattedStart?: string;
  formattedEnd?: string;
  isFullDayEvent?: boolean;
  durationInHours?: number;
  eventImage?: string;
  eventUrl?: string;
  videoUrl?: string;
}

export interface EventProps {
  event: EventData;
  fallback?: {
    [key: string]: EventData;
  };
}

export interface EventPageProps {
  params: {
    eventId: string;
  };
}

export interface QueryParams {
  newEvent?: boolean;
  edit_suggested?: boolean;
}

export interface EventRefs {
  mapsRef: RefObject<HTMLDivElement>;
  weatherRef: RefObject<HTMLDivElement>;
  eventsAroundRef: RefObject<HTMLDivElement>;
  editModalRef: RefObject<HTMLDivElement>;
}

export interface DynamicOptionsLoadingProps {
  error?: Error | null;
  isLoading?: boolean;
  pastDelay?: boolean;
  timedOut?: boolean;
}

export type DeleteReason = "not-exist" | "duplicated" | "offensive" | "others" | null;

export interface SelectOption {
  value: string;
  label: string;
}
