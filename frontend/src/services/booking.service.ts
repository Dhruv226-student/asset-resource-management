import { simulateDelay, MockApiError } from '@/lib/mock-api';
import { useAppStore } from '@/store/useAppStore';
import { Booking } from '@/types';

// Replace mock service implementation with real API client:
// import { apiClient } from '@/lib/api-client';

export async function getBookings(): Promise<Booking[]> {
  await simulateDelay(300);
  return useAppStore.getState().bookings;
}

// Convert HH:MM time string to minutes from midnight
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export async function createBooking(payload: {
  resourceId: string;
  resourceName: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  bookedFor: string;
  purpose: string;
  notes?: string;
}): Promise<Booking> {
  await simulateDelay(500);

  // Real API implementation:
  // return apiClient.post<Booking>('/bookings', payload);

  const { bookings, setBookings, currentUser, addActivityLog, addNotification } = useAppStore.getState();

  const newStartMin = timeToMinutes(payload.startTime);
  const newEndMin = timeToMinutes(payload.endTime);

  if (newEndMin <= newStartMin) {
    throw new MockApiError('End time must be after start time.', 400);
  }

  // Check for overlap on the same resource and date
  const conflictingBooking = bookings.find(b => {
    if (b.resourceId !== payload.resourceId || b.date !== payload.date || b.status === 'cancelled') {
      return false;
    }
    const existStartMin = timeToMinutes(b.startTime);
    const existEndMin = timeToMinutes(b.endTime);

    // Overlap: newStart < existingEnd AND newEnd > existingStart
    return newStartMin < existEndMin && newEndMin > existStartMin;
  });

  if (conflictingBooking) {
    throw new MockApiError('This resource is already booked during the selected time.', 409);
  }

  const newBooking: Booking = {
    ...payload,
    id: 'b' + Date.now(),
    department: currentUser?.departmentName || 'Information Technology',
    status: 'upcoming',
    bookedForId: currentUser?.id
  };

  setBookings([...bookings, newBooking]);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Book Resource',
      module: 'Resource Bookings',
      record: `${payload.resourceName} - ${payload.title}`,
      details: `Booked for ${payload.date} from ${payload.startTime} to ${payload.endTime}. Purpose: ${payload.purpose}`
    });
  }

  addNotification({
    type: 'booking-confirmed',
    title: 'Booking Confirmed',
    message: `Your booking for ${payload.resourceName} on ${payload.date} (${payload.startTime}-${payload.endTime}) has been confirmed.`,
    link: '/bookings'
  });

  return newBooking;
}

export async function cancelBooking(id: string): Promise<Booking> {
  await simulateDelay(400);

  const { bookings, setBookings, currentUser, addActivityLog, addNotification } = useAppStore.getState();
  
  const originalBooking = bookings.find(b => b.id === id);
  if (!originalBooking) throw new MockApiError('Booking not found.', 404);

  const targetBooking: Booking = { ...originalBooking, status: 'cancelled' };
  const updated = bookings.map(b => b.id === id ? targetBooking : b);
  setBookings(updated);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Cancel Booking',
      module: 'Resource Bookings',
      record: `${targetBooking.resourceName} - ${targetBooking.title}`,
      details: `Cancelled booking scheduled for ${targetBooking.date}.`
    });
  }

  addNotification({
    type: 'booking-cancelled',
    title: 'Booking Cancelled',
    message: `Booking for ${targetBooking.resourceName} on ${targetBooking.date} has been cancelled.`,
    link: '/bookings'
  });

  return targetBooking;
}

export async function rescheduleBooking(id: string, date: string, startTime: string, endTime: string): Promise<Booking> {
  await simulateDelay(500);

  const { bookings, setBookings, currentUser, addActivityLog, addNotification } = useAppStore.getState();
  
  const original = bookings.find(b => b.id === id);
  if (!original) throw new MockApiError('Booking not found.', 404);

  const newStartMin = timeToMinutes(startTime);
  const newEndMin = timeToMinutes(endTime);

  // Check for overlap excluding current booking
  const conflictingBooking = bookings.find(b => {
    if (b.id === id || b.resourceId !== original.resourceId || b.date !== date || b.status === 'cancelled') {
      return false;
    }
    const existStartMin = timeToMinutes(b.startTime);
    const existEndMin = timeToMinutes(b.endTime);

    return newStartMin < existEndMin && newEndMin > existStartMin;
  });

  if (conflictingBooking) {
    throw new MockApiError('This resource is already booked during the selected time.', 409);
  }

  const rescheduled: Booking = { ...original, date, startTime, endTime, status: 'upcoming' };
  const updated = bookings.map(b => b.id === id ? rescheduled : b);
  setBookings(updated);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Reschedule Booking',
      module: 'Resource Bookings',
      record: `${rescheduled.resourceName} - ${rescheduled.title}`,
      details: `Rescheduled to ${date} from ${startTime} to ${endTime}.`
    });
  }

  addNotification({
    type: 'booking-confirmed',
    title: 'Booking Rescheduled',
    message: `Your booking for ${rescheduled.resourceName} was rescheduled to ${date} (${startTime}-${endTime}).`,
    link: '/bookings'
  });

  return rescheduled;
}
