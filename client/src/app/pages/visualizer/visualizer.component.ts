import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ImageService, AppColor } from '../../services/image.service';

@Component({
  selector: 'app-visualizer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss']
})
export class VisualizerComponent implements OnInit {
  imageUrl: string | ArrayBuffer = 'assets/images/hero-room.png';
  wallPolygon: {x: number, y: number}[] = [];
  colors: AppColor[] = [];
  
  // State
  selectedColor: AppColor | null = null;
  opacity: number = 75;
  brightness: number = 100;
  finish: 'matte' | 'satin' | 'glossy' = 'matte';
  designType: 'solid' | 'dual' | 'pattern' = 'solid';
  showOriginal: boolean = false;
  isBeforeAfterMode: boolean = false;
  
  // Search and filter
  searchQuery: string = '';
  activeCategory: string = 'All';
  categories = ['All', 'Warm', 'Cool', 'Neutral', 'Accent'];

  constructor(private imageService: ImageService, private router: Router) {}

  ngOnInit() {
    const savedImg = this.imageService.getImage();
    if (savedImg) {
      this.imageUrl = savedImg;
    }
    
    this.wallPolygon = this.imageService.getPolygon();
    this.colors = this.imageService.getColors();
    
    // Select default color
    if (this.colors.length > 0) {
      this.selectedColor = this.colors[0]; // Sage Green
    }
  }

  get filteredColors() {
    return this.colors.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                            c.hex.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.activeCategory === 'All' || c.category === this.activeCategory;
      return matchesSearch && matchesCategory;
    });
  }

  selectColor(color: AppColor) {
    this.selectedColor = color;
    this.showOriginal = false;
  }

  setCategory(cat: string) {
    this.activeCategory = cat;
  }

  toggleOriginal() {
    this.showOriginal = !this.showOriginal;
  }

  toggleBeforeAfter() {
    this.isBeforeAfterMode = !this.isBeforeAfterMode;
    if (this.isBeforeAfterMode) {
      this.showOriginal = false;
    }
  }
  
  get polygonClipPath(): string {
    if (!this.wallPolygon || this.wallPolygon.length === 0) return '';
    const pointsStr = this.wallPolygon.map(p => `${p.x}% ${p.y}%`).join(', ');
    return `polygon(${pointsStr})`;
  }

  getBlendMode(): string {
    if (this.finish === 'matte') return 'multiply';
    if (this.finish === 'satin') return 'color';
    if (this.finish === 'glossy') return 'hard-light';
    return 'multiply';
  }

  saveDesign() {
    const designData = {
      color: this.selectedColor,
      opacity: this.opacity,
      brightness: this.brightness,
      finish: this.finish,
      designType: this.designType,
      date: new Date().toISOString()
    };
    localStorage.setItem('savedSmartPaintDesign', JSON.stringify(designData));
    alert('Design saved successfully! It will appear in My Projects.');
  }

  downloadImage() {
    alert('Downloading composite image...');
  }
}
