import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { HrAssistantService } from './hr-assistant.service';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant' | 'error';
  text: string;
  toolsUsed?: string[];
}

const MAX_QUESTION_LENGTH = 1000;

const EXAMPLE_QUESTIONS = [
  'Who was absent today?',
  'Show pending leave requests',
  'Who was late the most this month?',
];

function humanizeToolName(name: string): string {
  const words = name.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function describeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    switch (error.status) {
      case 400:
        return 'That question is empty or too long — please keep it under 1000 characters.';
      case 403:
        return 'Only company admins can use the assistant.';
      case 429:
        return 'The assistant is busy, try again in a moment.';
      default:
        if (error.status >= 500) {
          return 'The assistant is temporarily unavailable. Please try again shortly.';
        }
        return 'Something went wrong. Please try again.';
    }
  }
  return 'Something went wrong. Please try again.';
}

@Component({
  selector: 'app-hr-assistant',
  template: `
    <h1 class="h3 mb-1">HR Assistant</h1>
    <p class="text-muted mb-4">Ask about attendance and leave in plain language. Each question is answered on its own.</p>

    <div class="card shadow-sm border-0" style="max-width: 780px;">
      <div class="card-body d-flex flex-column" style="height: 60vh;">
        <div class="flex-grow-1 overflow-auto mb-3" aria-live="polite">
          @if (messages().length === 0) {
            <div class="d-flex flex-column gap-2 mb-3">
              <p class="text-muted small mb-1">Try one of these:</p>
              <div class="d-flex flex-wrap gap-2">
                @for (example of exampleQuestions; track example) {
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm"
                    [disabled]="loading()"
                    (click)="askExample(example)"
                  >
                    {{ example }}
                  </button>
                }
              </div>
            </div>
          }

          @for (message of messages(); track message.id) {
            <div class="d-flex mb-3" [class.justify-content-end]="message.role === 'user'">
              <div
                class="p-3 rounded-3"
                style="max-width: 80%; white-space: pre-line;"
                [class.bg-primary]="message.role === 'user'"
                [class.text-white]="message.role === 'user'"
                [class.bg-light]="message.role === 'assistant'"
                [class.bg-danger-subtle]="message.role === 'error'"
                [class.text-danger-emphasis]="message.role === 'error'"
              >
                <div class="small fw-semibold mb-1">
                  {{ message.role === 'user' ? 'You' : 'Assistant' }}
                </div>
                <div>{{ message.text }}</div>
                @if (message.toolsUsed?.length) {
                  <div class="small text-muted mt-2" [class.text-white-50]="message.role === 'user'">
                    Based on: {{ humanizedTools(message.toolsUsed!) }}
                  </div>
                }
              </div>
            </div>
          }

          @if (loading()) {
            <div class="d-flex mb-3">
              <div class="p-3 rounded-3 bg-light">
                <div class="small fw-semibold mb-1">Assistant</div>
                <div class="text-muted">Thinking…</div>
              </div>
            </div>
          }
        </div>

        <div class="border-top pt-3">
          <div class="d-flex gap-2 align-items-end">
            <div class="flex-grow-1">
              <textarea
                class="form-control"
                rows="2"
                placeholder="Ask a question about attendance or leave…"
                [value]="question()"
                [disabled]="loading()"
                (input)="onQuestionInput($event)"
                (keydown)="onKeydown($event)"
                aria-label="Question for the HR assistant"
              ></textarea>
              <div class="small text-muted mt-1" [class.text-danger]="question().length > maxLength">
                {{ question().length }} / {{ maxLength }}
              </div>
            </div>
            <button type="button" class="btn btn-primary" [disabled]="!canSend()" (click)="send()">Send</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HrAssistantComponent {
  private readonly hrAssistantService = inject(HrAssistantService);

  readonly maxLength = MAX_QUESTION_LENGTH;
  readonly exampleQuestions = EXAMPLE_QUESTIONS;

  messages = signal<ChatMessage[]>([]);
  question = signal('');
  loading = signal(false);

  canSend = computed(() => {
    const text = this.question().trim();
    return text.length > 0 && text.length <= this.maxLength && !this.loading();
  });

  private nextId = 0;

  onQuestionInput(event: Event): void {
    this.question.set((event.target as HTMLTextAreaElement).value);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  askExample(example: string): void {
    if (this.loading()) return;
    this.question.set(example);
    this.send();
  }

  send(): void {
    if (!this.canSend()) return;

    const question = this.question().trim();
    this.messages.update((current) => [...current, { id: this.nextId++, role: 'user', text: question }]);
    this.question.set('');
    this.loading.set(true);

    this.hrAssistantService.ask(question).subscribe({
      next: (result) => {
        this.messages.update((current) => [
          ...current,
          { id: this.nextId++, role: 'assistant', text: result.answer, toolsUsed: result.toolsUsed },
        ]);
        this.loading.set(false);
      },
      error: (error) => {
        this.messages.update((current) => [
          ...current,
          { id: this.nextId++, role: 'error', text: describeError(error) },
        ]);
        this.loading.set(false);
      },
    });
  }

  humanizedTools(toolsUsed: string[]): string {
    return toolsUsed.map(humanizeToolName).join(', ');
  }
}
