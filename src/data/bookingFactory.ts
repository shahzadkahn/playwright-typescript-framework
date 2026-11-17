import type { BookingPayload } from '@api/types';

/** Formats a Date as YYYY-MM-DD, the format the Booking API expects. */
function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const firstNames = ['Ayesha', 'Liam', 'Sofia', 'Noah', 'Zara', 'Ethan'];
const lastNames = ['Khan', 'Tremblay', 'Martin', 'Roy', 'Gagnon', 'Ali'];

/**
 * Builds a valid, unique booking. Pass overrides to set only the fields a
 * test cares about, which keeps each test focused on its own intent.
 */
export function buildBooking(overrides: Partial<BookingPayload> = {}): BookingPayload {
  const checkin = new Date();
  checkin.setDate(checkin.getDate() + randomInt(5, 30));
  const checkout = new Date(checkin);
  checkout.setDate(checkout.getDate() + randomInt(1, 7));

  return {
    firstname: firstNames[randomInt(0, firstNames.length - 1)],
    lastname: `${lastNames[randomInt(0, lastNames.length - 1)]}-${Date.now()}`,
    totalprice: randomInt(80, 900),
    depositpaid: Math.random() > 0.5,
    bookingdates: { checkin: isoDate(checkin), checkout: isoDate(checkout) },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
