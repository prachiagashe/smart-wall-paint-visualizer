import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';

export interface AppColor {
  id: string | number;
  _id?: string;
  name: string;
  hex: string;
  rgb?: string;
  brand?: string;
  category: string;
  family?: string;
  tone?: string;
  temperature?: string;
  rooms?: string[];
  styles?: string[];
  finishes: string[];
  description: string;
  swatchImage?: string;
  usageCount?: number;
  status?: string;
  colorCode?: string;
  pricePerUnit?: number;
  unit?: string;
  stock?: number;
  isAvailable?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private currentImage: string | ArrayBuffer | null = null;
  private wallPolygon: {x: number, y: number}[] = [];
  private apiUrl = 'http://localhost:5000/api/colors';
  private favApiUrl = 'http://localhost:5000/api/favorites';

  // Robust set of 20 realistic paint colors as fallback
  private fallbackColors: AppColor[] = [
    { id: 1, name: "Ocean Breeze", hex: "#8FA9B8", category: "Cool", family: "Blue", tone: "Medium", temperature: "Cool", finishes: ["Matte", "Satin", "Glossy"], description: "A calm coastal blue-grey that opens up compact rooms.", rooms: ["Living Room", "Bedroom", "Bathroom"], styles: ["Modern", "Minimal"], pricePerUnit: 250, unit: 'Swatch', stock: 100, isAvailable: true },
    { id: 2, name: "Sage Green", hex: "#879C76", category: "Cool", family: "Green", tone: "Medium", temperature: "Cool", finishes: ["Matte", "Satin"], description: "Muted botanical green for calm and natural interiors.", rooms: ["Bedroom", "Study"], styles: ["Modern", "Classic"] },
    { id: 3, name: "Warm Beige", hex: "#D9C7AE", category: "Warm", family: "Brown", tone: "Light", temperature: "Warm", finishes: ["Matte", "Satin"], description: "A soft sand neutral that flatters warm evening lighting.", rooms: ["Living Room", "Bedroom"], styles: ["Classic", "Luxury"] },
    { id: 4, name: "Soft Grey", hex: "#BFBFBA", category: "Neutral", family: "Grey", tone: "Light", temperature: "Neutral", finishes: ["Matte", "Satin", "Glossy"], description: "Balanced grey with a whisper of green for softer shadows.", rooms: ["Kitchen", "Living Room"], styles: ["Minimal", "Modern"] },
    { id: 5, name: "Terracotta", hex: "#B5674A", category: "Accent", family: "Orange", tone: "Medium", temperature: "Warm", finishes: ["Matte", "Satin"], description: "Earthy baked-clay tone for a confident feature wall.", rooms: ["Living Room", "Dining Room"], styles: ["Classic"] },
    { id: 6, name: "Dusty Blue", hex: "#7E93A8", category: "Cool", family: "Blue", tone: "Medium", temperature: "Cool", finishes: ["Matte", "Satin"], description: "Quiet denim blue that pairs beautifully with oak furniture.", rooms: ["Bedroom"], styles: ["Classic"] },
    { id: 7, name: "Ivory", hex: "#F2EADF", category: "Neutral", family: "White", tone: "Light", temperature: "Warm", finishes: ["Matte", "Satin", "Glossy"], description: "Creamy off-white base shade for bright, airy interiors.", rooms: ["Living Room", "Bedroom", "Kitchen"], styles: ["Minimal", "Luxury"] },
    { id: 8, name: "Forest Green", hex: "#3F5D4A", category: "Accent", family: "Green", tone: "Dark", temperature: "Cool", finishes: ["Matte", "Satin"], description: "Deep, library-inspired green for dramatic accent walls.", rooms: ["Study", "Dining Room"], styles: ["Classic", "Luxury"] },
    { id: 9, name: "Olive Mist", hex: "#7E8569", category: "Neutral", family: "Green", tone: "Medium", temperature: "Warm", finishes: ["Matte", "Satin"], description: "A gentle earth-tone green that brings the outside in.", rooms: ["Living Room", "Bedroom"], styles: ["Modern"] },
    { id: 10, name: "Sandstone", hex: "#CDBB9D", category: "Warm", family: "Brown", tone: "Medium", temperature: "Warm", finishes: ["Matte", "Satin"], description: "A warm, grounded neutral inspired by natural stone.", rooms: ["Living Room", "Bathroom"], styles: ["Classic"] },
    { id: 11, name: "Deep Navy", hex: "#2C3E50", category: "Accent", family: "Blue", tone: "Dark", temperature: "Cool", finishes: ["Matte", "Satin", "Glossy"], description: "Classic dark blue for a sophisticated, moody atmosphere.", rooms: ["Dining Room", "Bedroom"], styles: ["Luxury"] },
    { id: 12, name: "Clay", hex: "#9E6D5B", category: "Warm", family: "Brown", tone: "Medium", temperature: "Warm", finishes: ["Matte", "Satin"], description: "Rich, warm brown with reddish undertones for cozy spaces.", rooms: ["Living Room"], styles: ["Classic"] },
    { id: 13, name: "Warm White", hex: "#FDFBF7", category: "Neutral", family: "White", tone: "Light", temperature: "Warm", finishes: ["Matte", "Satin", "Glossy"], description: "A soft, inviting white that prevents spaces from feeling stark.", rooms: ["Kitchen", "Bathroom", "Living Room"], styles: ["Minimal"] },
    { id: 14, name: "Misty Blue", hex: "#A5B1C2", category: "Cool", family: "Blue", tone: "Light", temperature: "Cool", finishes: ["Matte", "Satin"], description: "Pale mineral tint that keeps small rooms feeling open.", rooms: ["Bathroom", "Bedroom"], styles: ["Modern"] },
    { id: 15, name: "Blush", hex: "#DEB8B8", category: "Warm", family: "Pink", tone: "Light", temperature: "Warm", finishes: ["Matte", "Satin"], description: "A delicate pink that adds subtle warmth without overwhelming.", rooms: ["Bedroom"], styles: ["Minimal", "Classic"] },
    { id: 16, name: "Mauve", hex: "#A98492", category: "Warm", family: "Purple", tone: "Medium", temperature: "Cool", finishes: ["Matte", "Satin"], description: "Sophisticated dusty purple for elegant bedrooms and lounges.", rooms: ["Bedroom", "Living Room"], styles: ["Luxury"] },
    { id: 17, name: "Mustard", hex: "#D4A373", category: "Accent", family: "Yellow", tone: "Medium", temperature: "Warm", finishes: ["Matte", "Satin"], description: "Golden ochre that turns hallway walls into a highlight.", rooms: ["Dining Room", "Living Room"], styles: ["Modern"] },
    { id: 18, name: "Charcoal", hex: "#4A4A4A", category: "Accent", family: "Grey", tone: "Dark", temperature: "Cool", finishes: ["Matte", "Satin", "Glossy"], description: "Architectural dark grey for media walls and studies.", rooms: ["Study", "Living Room"], styles: ["Modern", "Minimal"] },
    { id: 19, name: "Stone Grey", hex: "#95A5A6", category: "Neutral", family: "Grey", tone: "Medium", temperature: "Cool", finishes: ["Matte", "Satin"], description: "A cool mid-tone grey that provides a versatile backdrop.", rooms: ["Kitchen", "Living Room"], styles: ["Modern"] },
    { id: 20, name: "Cream", hex: "#FDF5E6", category: "Neutral", family: "White", tone: "Light", temperature: "Warm", finishes: ["Matte", "Satin", "Glossy"], description: "Rich, warm off-white ideal for traditional living spaces.", rooms: ["Living Room", "Bedroom"], styles: ["Classic"] }
  ];

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }

  setImage(img: string | ArrayBuffer | null) {
    this.currentImage = img;
  }

  getImage(): string | ArrayBuffer | null {
    return this.currentImage;
  }

  setPolygon(points: {x: number, y: number}[]) {
    this.wallPolygon = points;
  }

  getPolygon(): {x: number, y: number}[] {
    return this.wallPolygon;
  }

  getColors(): AppColor[] {
    return this.fallbackColors;
  }

  async fetchColors(): Promise<AppColor[]> {
    try {
      const colors = await firstValueFrom(this.http.get<AppColor[]>(this.apiUrl));
      if (colors && colors.length > 0) {
        return colors.map(c => ({...c, id: c._id || c.id}));
      }
      return this.fallbackColors;
    } catch (error) {
      console.warn('Could not fetch colors from backend, using fallback', error);
      return this.fallbackColors;
    }
  }

  async searchColors(params: any): Promise<AppColor[]> {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const colors = await firstValueFrom(this.http.get<AppColor[]>(`${this.apiUrl}/search?${queryParams}`));
      if (colors && colors.length > 0) {
        return colors.map(c => ({...c, id: c._id || c.id}));
      }
      return [];
    } catch (error) {
      console.error('Failed to search colors', error);
      return [];
    }
  }

  async getRecommendations(colorId: string | number): Promise<AppColor[]> {
    if (typeof colorId === 'number') {
      // Fallback recommendations if using local data
      return this.fallbackColors.slice(0, 4);
    }
    try {
      const recs = await firstValueFrom(this.http.get<AppColor[]>(`${this.apiUrl}/${colorId}/recommendations`));
      return recs.map(c => ({...c, id: c._id || c.id}));
    } catch (error) {
      console.error('Failed to fetch recommendations', error);
      return this.fallbackColors.slice(0, 4);
    }
  }

  async incrementUsage(id: string | number): Promise<void> {
    if (typeof id === 'number') return;
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/${id}/usage`, {}));
    } catch (error) {
      console.error('Failed to increment usage', error);
    }
  }

  async getFavorites(): Promise<AppColor[]> {
    const token = localStorage.getItem('token');
    if (!token) return [];
    
    try {
      const favs = await firstValueFrom(this.http.get<AppColor[]>(this.favApiUrl, this.getAuthHeaders()));
      return favs.map(c => ({...c, id: c._id || c.id}));
    } catch (error) {
      console.error('Failed to fetch favorites', error);
      return [];
    }
  }

  async addFavorite(colorId: string | number): Promise<void> {
    if (typeof colorId === 'number') return;
    try {
      await firstValueFrom(this.http.post(this.favApiUrl, { colorId }, this.getAuthHeaders()));
    } catch (error) {
      console.error('Failed to add favorite', error);
    }
  }

  async removeFavorite(colorId: string | number): Promise<void> {
    if (typeof colorId === 'number') return;
    try {
      await firstValueFrom(this.http.delete(`${this.favApiUrl}/${colorId}`, this.getAuthHeaders()));
    } catch (error) {
      console.error('Failed to remove favorite', error);
    }
  }
}
