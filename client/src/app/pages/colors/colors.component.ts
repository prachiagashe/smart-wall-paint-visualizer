import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ImageService, AppColor } from '../../services/image.service';

@Component({
  selector: 'app-colors',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './colors.component.html',
  styleUrls: ['./colors.component.scss']
})
export class ColorsComponent implements OnInit {
  searchQuery: string = '';
  activeFilter: string = 'All';
  filters = ['All', 'Warm', 'Cool', 'Neutral', 'Accent'];
  
  allColors: AppColor[] = [];
  favoriteIds: Set<number> = new Set<number>();
  
  // Track selected finish per color ID
  selectedFinishes: Record<number, string> = {};

  constructor(private imageService: ImageService, private router: Router) {}

  ngOnInit() {
    this.allColors = this.imageService.getColors();
    
    // Set default finishes
    this.allColors.forEach(c => {
      this.selectedFinishes[c.id] = c.finishes[0];
    });

    this.loadFavorites();
  }

  get filteredColors(): AppColor[] {
    let filtered = this.allColors;

    if (this.activeFilter !== 'All') {
      filtered = filtered.filter(c => c.category === this.activeFilter);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.hex.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
  }

  toggleFavorite(color: AppColor) {
    if (this.favoriteIds.has(color.id)) {
      this.favoriteIds.delete(color.id);
    } else {
      this.favoriteIds.add(color.id);
    }
    this.saveFavorites();
  }

  isFavorite(id: number): boolean {
    return this.favoriteIds.has(id);
  }

  private loadFavorites() {
    const saved = localStorage.getItem('smartpaint_favorites');
    if (saved) {
      try {
        const ids = JSON.parse(saved) as number[];
        this.favoriteIds = new Set<number>(ids);
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    }
  }

  private saveFavorites() {
    localStorage.setItem('smartpaint_favorites', JSON.stringify(Array.from(this.favoriteIds)));
  }

  selectFinish(colorId: number, finish: string) {
    this.selectedFinishes[colorId] = finish;
  }

  tryColor(color: AppColor) {
    const selectedFinish = this.selectedFinishes[color.id] || color.finishes[0];
    // Map 'Matte', 'Satin', 'Glossy' to 'matte', 'satin', 'glossy' for Visualizer
    const mappedFinish = selectedFinish.toLowerCase();
    
    this.router.navigate(['/visualizer'], {
      state: {
        color: color,
        finish: mappedFinish,
        cameFromColorsPage: true
      }
    });
  }
}
