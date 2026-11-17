import { type APIRequestContext, type APIResponse, expect } from '@playwright/test';
import type { BookingId, BookingPayload, CreatedBooking } from './types';

/**
 * A thin client for the Restful Booker API. Tests call intent-level methods
 * (createBooking, deleteBooking) instead of raw HTTP, so endpoints and auth
 * live in one place.
 */
export class BookingClient {
  private token?: string;

  constructor(private readonly request: APIRequestContext) {}

  /** Exchanges the demo admin credentials for a token used by write operations. */
  async authenticate(
    username = process.env.BOOKER_USERNAME ?? 'admin',
    password = process.env.BOOKER_PASSWORD ?? 'password123',
  ): Promise<string> {
    const response = await this.request.post('/auth', { data: { username, password } });
    expect(response.ok(), 'auth request should succeed').toBeTruthy();

    const body = (await response.json()) as { token?: string; reason?: string };
    if (!body.token) throw new Error(`Authentication failed: ${body.reason ?? 'no token returned'}`);

    this.token = body.token;
    return body.token;
  }

  private authHeaders(): Record<string, string> {
    if (!this.token) throw new Error('Call authenticate() before write operations');
    return { Cookie: `token=${this.token}` };
  }

  ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  listBookings(filters: Partial<Pick<BookingPayload, 'firstname' | 'lastname'>> = {}): Promise<APIResponse> {
    return this.request.get('/booking', { params: filters });
  }

  getBooking(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  createBookingRaw(data: unknown): Promise<APIResponse> {
    return this.request.post('/booking', { data });
  }

  async createBooking(payload: BookingPayload): Promise<CreatedBooking> {
    const response = await this.createBookingRaw(payload);
    expect(response.status(), 'create booking status').toBe(200);
    return (await response.json()) as CreatedBooking;
  }

  updateBooking(id: number, payload: BookingPayload, withAuth = true): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, {
      data: payload,
      headers: withAuth ? this.authHeaders() : {},
    });
  }

  partialUpdateBooking(id: number, changes: Partial<BookingPayload>): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data: changes, headers: this.authHeaders() });
  }

  deleteBooking(id: number): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: this.authHeaders() });
  }

  async bookingIds(filters: Partial<Pick<BookingPayload, 'firstname' | 'lastname'>> = {}): Promise<number[]> {
    const response = await this.listBookings(filters);
    expect(response.status()).toBe(200);
    const body = (await response.json()) as BookingId[];
    return body.map((b) => b.bookingid);
  }
}
