import { HttpErrorResponse } from '@angular/common/http';

export function extractErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body: unknown = error.error;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (body && typeof body === 'object' && 'error' in body && typeof (body as { error: unknown }).error === 'string') {
      return (body as { error: string }).error;
    }
    if (error.status === 0) {
      return 'Could not reach the server. Please check your connection and try again.';
    }
    return `Request failed (${error.status} ${error.statusText}).`;
  }
  return 'An unexpected error occurred.';
}
