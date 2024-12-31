import { Event } from "@store";
import { renderHook } from '@testing-library/react-hooks';
import { normalizeEvent } from "@utils/normalize";
import useSWR, { preload } from "swr";
import { useCalendarEventsList } from './useCalendarEventsList';

jest.mock("swr");
jest.mock("@utils/normalize");

describe('useCalendarEventsList() useCalendarEventsList method', () => {
  const mockNormalizeEvent = normalizeEvent as jest.MockedFunction<typeof normalizeEvent>;
  const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
  const mockPreload = preload as jest.MockedFunction<typeof preload>;

  const mockEvent: Event = {
    id: "1",
    title: "Test Event",
    description: "Test Description",
    startDate: "2023-01-01",
    endDate: "2023-01-02",
    location: "Test Location",
    url: "https://test.com",
    category: "Test Category",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNormalizeEvent.mockReturnValue(mockEvent);
  });

  it('should preload data on hook initialization', () => {
    // Arrange
    const from = new Date("2023-01-01");
    const until = new Date("2023-01-31");
    mockUseSWR.mockReturnValue({
      data: null,
      error: null,
      isValidating: false,
    });

    // Act
    const { result } = renderHook(() => useCalendarEventsList({ from, until }));

    // Assert
    expect(mockPreload).toHaveBeenCalled();
  });

  it('should return empty array when no data is available', () => {
    // Arrange
    const from = new Date("2023-01-01");
    const until = new Date("2023-01-31");
    mockUseSWR.mockReturnValue({
      data: { items: [] },
      error: null,
      isValidating: false,
    });

    // Act
    const { result } = renderHook(() => useCalendarEventsList({ from, until }));

    // Assert
    expect(result.current.data).toEqual({ items: [] });
  });

  it('should return null when error occurs', () => {
    // Arrange
    const from = new Date("2023-01-01");
    const until = new Date("2023-01-31");
    mockUseSWR.mockReturnValue({
      data: null,
      error: new Error("Test error"),
      isValidating: false,
    });

    // Act
    const { result } = renderHook(() => useCalendarEventsList({ from, until }));

    // Assert
    expect(result.current.data).toBeNull();
  });

  it('should normalize and return events when data is available', () => {
    // Arrange
    const from = new Date("2023-01-01");
    const until = new Date("2023-01-31");
    const mockItems = [mockEvent];
    mockUseSWR.mockReturnValue({
      data: { items: mockItems },
      error: null,
      isValidating: false,
    });

    // Act
    const { result } = renderHook(() => useCalendarEventsList({ from, until }));

    // Assert
    expect(result.current.data).toEqual({ items: mockItems });
  });
});
