import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-modal',
  template: `
    @if (message()) {
      <div class="modal d-block" tabindex="-1" role="dialog" style="background: rgba(0, 0, 0, 0.5);">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Something went wrong</h5>
              <button type="button" class="btn-close" aria-label="Close" (click)="closed.emit()"></button>
            </div>
            <div class="modal-body">
              <p class="mb-0">{{ message() }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" (click)="closed.emit()">Close</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ErrorModalComponent {
  message = input<string | null>(null);
  closed = output<void>();
}
