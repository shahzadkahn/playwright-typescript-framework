import { test, expect } from '@fixtures';
import { buildBooking } from '@data/bookingFactory';
import type { BookingPayload } from '@api/types';

test.describe('Booking API', () => {
  test('health check responds @smoke', async ({ bookingClient }) => {
    const response = await bookingClient.ping();
    expect(response.status()).toBe(201);
  });

  test('creates a booking and returns it unchanged @smoke', async ({ authedBookingClient }) => {
    const payload = buildBooking();

    const created = await authedBookingClient.createBooking(payload);
    authedBookingClient.track(created.bookingid);

    expect(created.bookingid).toEqual(expect.any(Number));
    expect(created.booking).toEqual(payload);

    const fetched = await authedBookingClient.getBooking(created.bookingid);
    expect(fetched.status()).toBe(200);
    expect(await fetched.json()).toEqual(payload);
  });

  test('finds a new booking by guest name', async ({ authedBookingClient }) => {
    const payload = buildBooking();
    const { bookingid } = await authedBookingClient.createBooking(payload);
    authedBookingClient.track(bookingid);

    const ids = await authedBookingClient.bookingIds({
      firstname: payload.firstname,
      lastname: payload.lastname,
    });

    expect(ids).toContain(bookingid);
  });

  test('fully updates a booking', async ({ authedBookingClient }) => {
    const { bookingid } = await authedBookingClient.createBooking(buildBooking());
    authedBookingClient.track(bookingid);

    const updated: BookingPayload = buildBooking({ totalprice: 450, additionalneeds: 'Late checkout' });
    const response = await authedBookingClient.updateBooking(bookingid, updated);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(updated);
  });

  test('partially updates only the given fields', async ({ authedBookingClient }) => {
    const original = buildBooking();
    const { bookingid } = await authedBookingClient.createBooking(original);
    authedBookingClient.track(bookingid);

    const response = await authedBookingClient.partialUpdateBooking(bookingid, { depositpaid: !original.depositpaid });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ...original, depositpaid: !original.depositpaid });
  });

  test('deletes a booking', async ({ authedBookingClient }) => {
    const { bookingid } = await authedBookingClient.createBooking(buildBooking());

    const deleted = await authedBookingClient.deleteBooking(bookingid);
    expect(deleted.status()).toBe(201);

    const fetched = await authedBookingClient.getBooking(bookingid);
    expect(fetched.status()).toBe(404);
  });
});

test.describe('Booking API security and validation', () => {
  test('rejects an update without a token', async ({ authedBookingClient }) => {
    const { bookingid } = await authedBookingClient.createBooking(buildBooking());
    authedBookingClient.track(bookingid);

    const response = await authedBookingClient.updateBooking(bookingid, buildBooking(), false);

    expect(response.status()).toBe(403);
  });

  test('rejects a booking with required fields missing', async ({ bookingClient }) => {
    const response = await bookingClient.createBookingRaw({ firstname: 'Only' });

    // The demo API answers 500 here; a production API should return 400.
    expect(response.ok()).toBeFalsy();
  });

  test('returns 404 for a booking that does not exist', async ({ bookingClient }) => {
    const response = await bookingClient.getBooking(999_999_999);
    expect(response.status()).toBe(404);
  });
});
