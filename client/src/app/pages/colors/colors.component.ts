import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
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
  sortBy: string = 'Popular';
  
  allColors: AppColor[] = [];
  favoriteIds: Set<string | number> = new Set<string | number>();
  isLoading: boolean = true;
  
  // Category Navigation
  categories = ['All Colors', 'Whites & Neutrals', 'Greys', 'Blues', 'Greens', 'Browns', 'Reds & Oranges', 'Yellows', 'Purples & Pinks'];
  activeCategory: string = 'All Colors';

  // Advanced Filters
  filters = {
    temperature: [] as string[],
    room: [] as string[],
    style: [] as string[],
    finish: [] as string[]
  };

  isMobileFilterOpen: boolean = false;

  // Track selected finish per color ID
  selectedFinishes: Record<string, string> = {};

  // Compare mode
  compareColors: AppColor[] = [];
  compareMode: boolean = false;

  // Details Modal
  selectedModalColor: AppColor | null = null;

  constructor(private imageService: ImageService, private router: Router, private route: ActivatedRoute) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
      }
    });

    await this.loadData();
    this.loadFavorites();
  }

  async loadData() {
    this.isLoading = true;
    this.allColors = await this.imageService.fetchColors();
    
    // Set default finishes
    this.allColors.forEach(c => {
      this.selectedFinishes[c.id.toString()] = c.finishes[0];
    });
    this.isLoading = false;
  }

  get popularColors(): AppColor[] {
    return [...this.allColors]
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 5);
  }

  get filteredColors(): AppColor[] {
    let filtered = this.allColors;

    // Category Filter
    if (this.activeCategory !== 'All Colors') {
      filtered = filtered.filter(c => {
        // Map category names loosely
        const cat = c.category?.toLowerCase() || '';
        const name = c.name?.toLowerCase() || '';
        const active = this.activeCategory.toLowerCase();
        
        if (active.includes('white') || active.includes('neutral')) return cat === 'neutral' || name.includes('white');
        if (active.includes('grey')) return name.includes('grey') || cat === 'cool';
        if (active.includes('blue')) return name.includes('blue');
        if (active.includes('green')) return name.includes('green') || name.includes('sage');
        if (active.includes('brown')) return name.includes('brown') || name.includes('clay');
        if (active.includes('red') || active.includes('orange')) return name.includes('red') || name.includes('terracotta');
        if (active.includes('yellow')) return name.includes('yellow') || name.includes('mustard');
        if (active.includes('purple') || active.includes('pink')) return name.includes('purple') || name.includes('mauve') || name.includes('blush');
        return cat === active;
      });
    }

    // Advanced Filters
    if (this.filters.temperature.length > 0) {
      filtered = filtered.filter(c => c.temperature && this.filters.temperature.includes(c.temperature));
    }
    if (this.filters.room.length > 0) {
      filtered = filtered.filter(c => c.rooms && c.rooms.some(r => this.filters.room.includes(r)));
    }
    if (this.filters.style.length > 0) {
      filtered = filtered.filter(c => c.styles && c.styles.some(s => this.filters.style.includes(s)));
    }
    if (this.filters.finish.length > 0) {
      filtered = filtered.filter(c => c.finishes && c.finishes.some(f => this.filters.finish.includes(f)));
    }

    // Search Query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.hex.toLowerCase().includes(query)
      );
    }

    // Sort
    if (this.sortBy === 'A-Z') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortBy === 'Popular' || this.sortBy === 'Most Used') {
      filtered.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    } else if (this.sortBy === 'Newest') {
      // Assuming higher ID means newer for fallback, or just reverse
      filtered.sort((a, b) => (b.id > a.id ? 1 : -1));
    }

    return filtered;
  }

  setCategory(category: string) {
    this.activeCategory = category;
  }

  toggleFilter(group: 'temperature' | 'room' | 'style' | 'finish', value: string) {
    const index = this.filters[group].indexOf(value);
    if (index === -1) {
      this.filters[group].push(value);
    } else {
      this.filters[group].splice(index, 1);
    }
  }

  isFilterActive(group: 'temperature' | 'room' | 'style' | 'finish', value: string): boolean {
    return this.filters[group].includes(value);
  }

  clearAllFilters() {
    this.filters = { temperature: [], room: [], style: [], finish: [] };
    this.searchQuery = '';
    this.activeCategory = 'All Colors';
  }

  toggleFavorite(color: AppColor, event?: Event) {
    if (event) event.stopPropagation();
    
    if (this.favoriteIds.has(color.id)) {
      this.favoriteIds.delete(color.id);
    } else {
      this.favoriteIds.add(color.id);
    }
    this.saveFavorites();
  }

  isFavorite(id: string | number): boolean {
    return this.favoriteIds.has(id);
  }

  private loadFavorites() {
    const saved = localStorage.getItem('smartpaint_favorites');
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        this.favoriteIds = new Set<string | number>(ids);
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    }
  }

  private saveFavorites() {
    localStorage.setItem('smartpaint_favorites', JSON.stringify(Array.from(this.favoriteIds)));
  }

  selectFinish(colorId: string | number, finish: string, event?: Event) {
    if (event) event.stopPropagation();
    this.selectedFinishes[colorId.toString()] = finish;
  }

  toggleCompare(color: AppColor, event?: Event) {
    if (event) event.stopPropagation();
    const index = this.compareColors.findIndex(c => c.id === color.id);
    if (index > -1) {
      this.compareColors.splice(index, 1);
    } else if (this.compareColors.length < 3) {
      this.compareColors.push(color);
    }
  }

  isInCompare(color: AppColor): boolean {
    return this.compareColors.some(c => c.id === color.id);
  }

  clearCompare() {
    this.compareColors = [];
  }

  openModal(color: AppColor) {
    this.selectedModalColor = color;
  }

  closeModal() {
    this.selectedModalColor = null;
  }

  async tryColor(color: AppColor, event?: Event) {
    if (event) event.stopPropagation();
    
    // Increment usage
    await this.imageService.incrementUsage(color.id);

    const selectedFinish = this.selectedFinishes[color.id.toString()] || color.finishes[0];
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
