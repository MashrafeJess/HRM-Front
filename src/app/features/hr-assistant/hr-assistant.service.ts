import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AiAnswer } from './hr-assistant.model';

@Injectable({ providedIn: 'root' })
export class HrAssistantService {
  private readonly http = inject(HttpClient);

  ask(question: string): Observable<AiAnswer> {
    const params = new HttpParams().set('question', question);
    return this.http.get<AiAnswer>('/api/Ai/Ask', { params });
  }
}
