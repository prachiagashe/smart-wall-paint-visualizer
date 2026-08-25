import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { AppColor } from './image.service';

@Injectable({
  providedIn: 'root'
})
export class SavedColoursService {
  private apiUrl = 'http://localhost:5000/api/favorites';

  private savedColoursSubject = new BehaviorSubject<AppColor[]>([]);
  public savedColours$ = this.savedColoursSubject.asObservable();

  private savedCountSubject = new BehaviorSubject<number>(0);
  public savedCount$ = this.savedCountSubject.asObservable();

  private authSub: Subscription;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadSavedColours();
      } else {
        this.clearState();
      }
    });
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }

  private clearState() {
    this.savedColoursSubject.next([]);
    this.savedCountSubject.next(0);
  }

  public loadSavedColours() {
    this.http.get<AppColor[]>(this.apiUrl, this.getAuthHeaders()).subscribe({
      next: (colours) => {
        const processedColours = colours.map(c => ({...c, id: c._id || c.id}));
        this.savedColoursSubject.next(processedColours);
        this.savedCountSubject.next(processedColours.length);
      },
      error: (err) => {
        console.error('Failed to load saved colours', err);
      }
    });
  }

  public addSavedColour(colorId: string | number): Observable<any> {
    const request = this.http.post(this.apiUrl, { colorId }, this.getAuthHeaders());
    request.subscribe({
      next: () => {
        this.loadSavedColours(); // Reload to get updated list and count
      },
      error: (err) => {
        console.error('Failed to add saved colour', err);
      }
    });
    return request;
  }

  public removeSavedColour(colorId: string | number): Observable<any> {
    const request = this.http.delete(`${this.apiUrl}/${colorId}`, this.getAuthHeaders());
    request.subscribe({
      next: () => {
        this.loadSavedColours(); // Reload to get updated list and count
      },
      error: (err) => {
        console.error('Failed to remove saved colour', err);
      }
    });
    return request;
  }
  
  public isSaved(colorId: string | number): boolean {
    return this.savedColoursSubject.value.some(c => c.id === colorId);
  }
}
