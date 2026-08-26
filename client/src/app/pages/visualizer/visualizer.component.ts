import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ImageService, AppColor } from '../../services/image.service';
import { AuthService } from '../../services/auth.service';

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
  
  @ViewChild('baseImage') baseImageRef!: ElementRef<HTMLImageElement>;
  isDownloading: boolean = false;
  
  // State
  selectedColor: AppColor | null = null;
  opacity: number = 75;
  brightness: number = 100;
  finish: 'matte' | 'satin' | 'glossy' = 'matte';
  designType: 'solid' | 'dual' | 'pattern' = 'solid';
  showOriginal: boolean = false;
  isBeforeAfterMode: boolean = false;
  cameFromColorsPage: boolean = false;
  
  // Search and filter
  searchQuery: string = '';
  activeCategory: string = 'All';
  categories = ['All', 'Warm', 'Cool', 'Neutral', 'Accent'];

  constructor(private imageService: ImageService, private router: Router, private authService: AuthService) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      if (nav.extras.state['cameFromColorsPage']) {
        this.cameFromColorsPage = true;
      }
      if (nav.extras.state['color']) {
        this.selectedColor = nav.extras.state['color'];
      }
      if (nav.extras.state['finish']) {
        this.finish = nav.extras.state['finish'];
      }
    }
  }

  ngOnInit() {
    const savedImg = this.imageService.getImage();
    if (savedImg) {
      this.imageUrl = savedImg;
    }
    
    this.wallPolygon = this.imageService.getPolygon();
    this.colors = this.imageService.getColors();
    
    // Select default color if none passed via routing state
    if (!this.selectedColor && this.colors.length > 0) {
      this.selectedColor = this.colors[0]; // Ocean Breeze/Sage Green
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
    const action = () => {
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
    };

    this.authService.requireLogin(action);
  }

  private async generatePreviewBlob(): Promise<Blob | null> {
    const img = this.baseImageRef.nativeElement;
    if (!img.complete || img.naturalWidth === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.filter = `brightness(${this.brightness / 100})`;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';

    if (!this.showOriginal && this.selectedColor) {
      ctx.save();
      
      if (this.wallPolygon && this.wallPolygon.length > 0) {
        ctx.beginPath();
        this.wallPolygon.forEach((point, index) => {
          const x = (point.x / 100) * canvas.width;
          const y = (point.y / 100) * canvas.height;
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.clip();
      }

      ctx.globalAlpha = this.opacity / 100;
      
      if (this.finish === 'matte') ctx.globalCompositeOperation = 'multiply';
      else if (this.finish === 'satin') ctx.globalCompositeOperation = 'color';
      else if (this.finish === 'glossy') ctx.globalCompositeOperation = 'hard-light';
      else ctx.globalCompositeOperation = 'multiply';

      ctx.fillStyle = this.selectedColor.hex;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (this.designType === 'dual') {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.5, 'rgba(255,255,255,0)');
        grad.addColorStop(0.5, 'rgba(255,255,255,0.4)');
        grad.addColorStop(1, 'rgba(255,255,255,0.4)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (this.designType === 'pattern') {
        const pCanvas = document.createElement('canvas');
        pCanvas.width = 20;
        pCanvas.height = 20;
        const pCtx = pCanvas.getContext('2d');
        if (pCtx) {
          pCtx.strokeStyle = 'rgba(255,255,255,0.1)';
          pCtx.lineWidth = 10;
          pCtx.beginPath();
          pCtx.moveTo(0, 0);
          pCtx.lineTo(20, 20);
          pCtx.stroke();
          const pattern = ctx.createPattern(pCanvas, 'repeat');
          if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        }
      }
      
      ctx.restore();
    }

    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), 'image/png', 1.0);
    });
  }

  async downloadPreview() {
    this.isDownloading = true;
    try {
      const blob = await this.generatePreviewBlob();
      if (!blob) throw new Error('Could not generate preview');
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      const colorName = this.selectedColor ? this.selectedColor.name.replace(/\s+/g, '_') : 'Preview';
      a.download = `SmartPaint_${colorName}_${dateStr}.png`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
      
      setTimeout(() => alert('Preview downloaded successfully.'), 100);
    } catch (err) {
      alert('Unable to download preview. Please try again.');
    } finally {
      this.isDownloading = false;
    }
  }

  async downloadOriginal() {
    try {
      const img = this.baseImageRef.nativeElement;
      let srcToFetch = img.src;
      // Handle data urls (like uploaded images which might be base64) directly
      if (srcToFetch.startsWith('data:')) {
        const a = document.createElement('a');
        a.download = 'SmartPaint_Original.png';
        a.href = srcToFetch;
        a.click();
        return;
      }
      
      const response = await fetch(srcToFetch);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = 'SmartPaint_Original.png';
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Unable to download original image.');
    }
  }

  async sharePreview() {
    this.isDownloading = true;
    try {
      const blob = await this.generatePreviewBlob();
      if (!blob) throw new Error('Could not generate preview');
      
      const file = new File([blob], 'SmartPaint_Preview.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        const title = 'SmartPaint Preview';
        const text = this.selectedColor ? `Check out my room painted in ${this.selectedColor.name} (${this.selectedColor.hex})!` : 'Check out my room preview!';
        await navigator.share({
          title,
          text,
          files: [file]
        });
      } else {
        alert('Sharing is not supported on this browser.');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
         alert('Unable to share preview.');
      }
    } finally {
      this.isDownloading = false;
    }
  }
}
