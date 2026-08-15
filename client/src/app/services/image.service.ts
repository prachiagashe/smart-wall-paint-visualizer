import { Injectable } from '@angular/core';

export interface AppColor {
  id: number;
  name: string;
  hex: string;
  category: string;
  finishes: string[];
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private currentImage: string | ArrayBuffer | null = null;
  private wallPolygon: {x: number, y: number}[] = [];

  // Robust set of 20 realistic paint colors
  private colors: AppColor[] = [
    { id: 1, name: "Ocean Breeze", hex: "#8FA9B8", category: "Cool", finishes: ["Matte", "Satin", "Glossy"], description: "A calm coastal blue-grey that opens up compact rooms." },
    { id: 2, name: "Sage Green", hex: "#879C76", category: "Cool", finishes: ["Matte", "Satin"], description: "Muted botanical green for calm and natural interiors." },
    { id: 3, name: "Warm Beige", hex: "#D9C7AE", category: "Warm", finishes: ["Matte", "Satin"], description: "A soft sand neutral that flatters warm evening lighting." },
    { id: 4, name: "Soft Grey", hex: "#BFBFBA", category: "Neutral", finishes: ["Matte", "Satin", "Glossy"], description: "Balanced grey with a whisper of green for softer shadows." },
    { id: 5, name: "Terracotta", hex: "#B5674A", category: "Accent", finishes: ["Matte", "Satin"], description: "Earthy baked-clay tone for a confident feature wall." },
    { id: 6, name: "Dusty Blue", hex: "#7E93A8", category: "Cool", finishes: ["Matte", "Satin"], description: "Quiet denim blue that pairs beautifully with oak furniture." },
    { id: 7, name: "Ivory", hex: "#F2EADF", category: "Neutral", finishes: ["Matte", "Satin", "Glossy"], description: "Creamy off-white base shade for bright, airy interiors." },
    { id: 8, name: "Forest Green", hex: "#3F5D4A", category: "Accent", finishes: ["Matte", "Satin"], description: "Deep, library-inspired green for dramatic accent walls." },
    { id: 9, name: "Olive Mist", hex: "#7E8569", category: "Neutral", finishes: ["Matte", "Satin"], description: "A gentle earth-tone green that brings the outside in." },
    { id: 10, name: "Sandstone", hex: "#CDBB9D", category: "Warm", finishes: ["Matte", "Satin"], description: "A warm, grounded neutral inspired by natural stone." },
    { id: 11, name: "Deep Navy", hex: "#2C3E50", category: "Accent", finishes: ["Matte", "Satin", "Glossy"], description: "Classic dark blue for a sophisticated, moody atmosphere." },
    { id: 12, name: "Clay", hex: "#9E6D5B", category: "Warm", finishes: ["Matte", "Satin"], description: "Rich, warm brown with reddish undertones for cozy spaces." },
    { id: 13, name: "Warm White", hex: "#FDFBF7", category: "Neutral", finishes: ["Matte", "Satin", "Glossy"], description: "A soft, inviting white that prevents spaces from feeling stark." },
    { id: 14, name: "Misty Blue", hex: "#A5B1C2", category: "Cool", finishes: ["Matte", "Satin"], description: "Pale mineral tint that keeps small rooms feeling open." },
    { id: 15, name: "Blush", hex: "#DEB8B8", category: "Warm", finishes: ["Matte", "Satin"], description: "A delicate pink that adds subtle warmth without overwhelming." },
    { id: 16, name: "Mauve", hex: "#A98492", category: "Warm", finishes: ["Matte", "Satin"], description: "Sophisticated dusty purple for elegant bedrooms and lounges." },
    { id: 17, name: "Mustard", hex: "#D4A373", category: "Accent", finishes: ["Matte", "Satin"], description: "Golden ochre that turns hallway walls into a highlight." },
    { id: 18, name: "Charcoal", hex: "#4A4A4A", category: "Accent", finishes: ["Matte", "Satin", "Glossy"], description: "Architectural dark grey for media walls and studies." },
    { id: 19, name: "Stone Grey", hex: "#95A5A6", category: "Neutral", finishes: ["Matte", "Satin"], description: "A cool mid-tone grey that provides a versatile backdrop." },
    { id: 20, name: "Cream", hex: "#FDF5E6", category: "Neutral", finishes: ["Matte", "Satin", "Glossy"], description: "Rich, warm off-white ideal for traditional living spaces." }
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
