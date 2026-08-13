import { Injectable } from '@angular/core';

export interface AppColor {
  id: number;
  name: string;
  hex: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private currentImage: string | ArrayBuffer | null = null;
  private wallPolygon: {x: number, y: number}[] = [];

  // Robust set of 20 realistic paint colors
  private colors: AppColor[] = [
    { id: 1, name: "Sage Green", hex: "#879C76", category: "Neutral" },
    { id: 2, name: "Terracotta", hex: "#B96545", category: "Warm" },
    { id: 3, name: "Dusty Blue", hex: "#8199AD", category: "Cool" },
    { id: 4, name: "Warm Beige", hex: "#D8C6A8", category: "Neutral" },
    { id: 5, name: "Soft Grey", hex: "#B8B7B1", category: "Neutral" },
    { id: 6, name: "Forest Green", hex: "#3F604F", category: "Cool" },
    { id: 7, name: "Ivory", hex: "#EEE7DA", category: "Neutral" },
    { id: 8, name: "Ocean Breeze", hex: "#6C939A", category: "Cool" },
    { id: 9, name: "Clay", hex: "#9E6D5B", category: "Warm" },
    { id: 10, name: "Sandstone", hex: "#CDBB9D", category: "Neutral" },
    { id: 11, name: "Olive Mist", hex: "#7E8569", category: "Neutral" },
    { id: 12, name: "Deep Navy", hex: "#2C3E50", category: "Accent" },
    { id: 13, name: "Misty Blue", hex: "#A5B1C2", category: "Cool" },
    { id: 14, name: "Cream", hex: "#FDF5E6", category: "Neutral" },
    { id: 15, name: "Charcoal", hex: "#4A4A4A", category: "Accent" },
    { id: 16, name: "Blush", hex: "#DEB8B8", category: "Warm" },
    { id: 17, name: "Mauve", hex: "#A98492", category: "Warm" },
    { id: 18, name: "Mustard", hex: "#D4A373", category: "Accent" },
    { id: 19, name: "Stone Grey", hex: "#95A5A6", category: "Neutral" },
    { id: 20, name: "Warm White", hex: "#FDFBF7", category: "Neutral" }
  ];

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
    return this.colors;
  }
}
