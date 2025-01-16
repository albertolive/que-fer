export interface FormState {
  isDisabled: boolean;
  isPristine: boolean;
  message: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormData {
  title: string;
  description: string;
  startDate: Date | string;
  endDate: Date | string;
  region: SelectOption | string;
  town: SelectOption | string;
  location: string;
  imageUploaded: string | null;
  eventUrl: string;
}

export interface EditEventProps {
  event: FormData;
}

export interface EditEventPageProps {
  params: {
    eventId: string;
  };
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  event?: FormData;
}
