import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ImageService, AppColor } from '../../services/image.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';

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
  categories = ['All Colours', 'Reds', 'Oranges', 'Yellows', 'Greens', 'Blues', 'Purples', 'Pinks', 'Browns', 'Greys', 'Whites'];
  activeCategory: string = 'All Colours';

  // View States
  showOnlySaved: boolean = false;

  // Advanced Filters
  filters = {
    temperature: [] as string[],
    room: [] as string[],
    tone: [] as string[],
    finish: [] as string[],
    family: [] as string[]
  };

  isMobileFilterOpen: boolean = false;
  selectedFinishes: Record<string, string> = {};

  // Details Modal
  selectedModalColor: AppColor | null = null;
  modalQuantity: number = 1;
  recommendedColors: AppColor[] = [];
  isLoadingRecommendations: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';

  // Find My Color Wizard
  isWizardOpen: boolean = false;
  wizardStep: number = 1;
  wizardAnswers = { room: '', mood: '', tone: '' };
  wizardRecommendations: AppColor[] = [];

  constructor(
    private imageService: ImageService, 
    public authService: AuthService, 
    private router: Router, 
    private route: ActivatedRoute,
    private cartService: CartService,
    private orderService: OrderService
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['search']) this.searchQuery = params['search'];
      if (params['saved'] === 'true') this.showOnlySaved = true;
    });

    await this.loadData();
    await this.loadFavorites();
  }

  async loadData() {
    this.isLoading = true;
    this.allColors = await this.imageService.fetchColors();
    this.allColors.forEach(c => {
      if (c.finishes && c.finishes.length) {
        this.selectedFinishes[c.id.toString()] = c.finishes[0];
      }
    });
    this.isLoading = false;
  }

  async loadFavorites() {
    if (this.authService.isLoggedIn()) {
      const favs = await this.imageService.getFavorites();
      this.favoriteIds = new Set(favs.map(f => f.id));
    } else {
      const saved = localStorage.getItem('smartpaint_favorites');
      if (saved) {
        try { this.favoriteIds = new Set(JSON.parse(saved)); } catch (e) {}
      }
    }
  }

  async toggleFavorite(color: AppColor, event?: Event) {
    if (event) event.stopPropagation();

    // Action Gating
    const action = async () => {
      const isFav = this.favoriteIds.has(color.id);
      if (isFav) {
        this.favoriteIds.delete(color.id);
        if (this.authService.isLoggedIn()) await this.imageService.removeFavorite(color.id);
      } else {
        this.favoriteIds.add(color.id);
        if (this.authService.isLoggedIn()) await this.imageService.addFavorite(color.id);
      }

      if (!this.authService.isLoggedIn()) {
        localStorage.setItem('smartpaint_favorites', JSON.stringify(Array.from(this.favoriteIds)));
      }
    };

    // If they aren't logged in, pop the modal and cache the action
    this.authService.requireLogin(action);
  }

  isFavorite(id: string | number): boolean {
    return this.favoriteIds.has(id);
  }

  get filteredColors(): AppColor[] {
    let filtered = this.allColors;

    if (this.showOnlySaved) {
      filtered = filtered.filter(c => this.favoriteIds.has(c.id));
    }

    // Horizontal Category Nav
    if (this.activeCategory !== 'All Colours') {
      // Map plural category to singular family
      const famMap: any = {
        'Reds': 'Red', 'Oranges': 'Orange', 'Yellows': 'Yellow', 'Greens': 'Green', 
        'Blues': 'Blue', 'Purples': 'Purple', 'Pinks': 'Pink', 'Browns': 'Brown', 
        'Greys': 'Grey', 'Whites': 'White'
      };
      const targetFamily = famMap[this.activeCategory];
      if (targetFamily) {
        filtered = filtered.filter(c => c.family === targetFamily || (c.category && c.category.includes(targetFamily)));
      }
    }

    // Sidebar Filters
    if (this.filters.temperature.length > 0) {
      filtered = filtered.filter(c => c.temperature && this.filters.temperature.includes(c.temperature));
    }
    if (this.filters.room.length > 0) {
      filtered = filtered.filter(c => c.rooms && c.rooms.some(r => this.filters.room.includes(r)));
    }
    if (this.filters.tone.length > 0) {
      filtered = filtered.filter(c => c.tone && this.filters.tone.includes(c.tone));
    }
    if (this.filters.finish.length > 0) {
      filtered = filtered.filter(c => c.finishes && c.finishes.some(f => this.filters.finish.includes(f)));
    }
    if (this.filters.family.length > 0) {
      filtered = filtered.filter(c => c.family && this.filters.family.includes(c.family));
    }

    // Search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.hex.toLowerCase().includes(q) ||
        (c.family && c.family.toLowerCase().includes(q)) ||
        (c.rooms && c.rooms.some(r => r.toLowerCase().includes(q))) ||
        (c.temperature && c.temperature.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (this.sortBy) {
      case 'A-Z': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'Z-A': filtered.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'Light to Dark': filtered.sort((a, b) => (a.tone === 'Light' ? -1 : 1)); break; // Basic tone sort
      case 'Dark to Light': filtered.sort((a, b) => (a.tone === 'Dark' ? -1 : 1)); break;
      case 'Most Popular':
      case 'Recommended': filtered.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)); break;
      case 'Recently Added': filtered.sort((a, b) => (b.id > a.id ? 1 : -1)); break;
    }

    return filtered;
  }

  get activeFilterCount(): number {
    return this.filters.temperature.length + this.filters.room.length + 
           this.filters.tone.length + this.filters.finish.length + this.filters.family.length;
  }

  setCategory(category: string) {
    this.activeCategory = category;
    this.showOnlySaved = false;
  }

  toggleFilter(group: keyof ColorsComponent['filters'], value: string) {
    const index = this.filters[group].indexOf(value);
    if (index === -1) this.filters[group].push(value);
    else this.filters[group].splice(index, 1);
  }

  isFilterActive(group: keyof ColorsComponent['filters'], value: string): boolean {
    return this.filters[group].includes(value);
  }

  clearAllFilters() {
    this.filters = { temperature: [], room: [], tone: [], finish: [], family: [] };
    this.searchQuery = '';
    this.activeCategory = 'All Colours';
    this.showOnlySaved = false;
  }

  selectFinish(colorId: string | number, finish: string, event?: Event) {
    if (event) event.stopPropagation();
    this.selectedFinishes[colorId.toString()] = finish;
  }

  async openModal(color: AppColor) {
    this.selectedModalColor = color;
    this.modalQuantity = 1;
    this.isLoadingRecommendations = true;
    this.imageService.getRecommendations(color.id).then(recs => {
      this.recommendedColors = recs;
      this.isLoadingRecommendations = false;
    });
  }

  closeModal() {
    this.selectedModalColor = null;
    this.recommendedColors = [];
  }

  async tryColor(color: AppColor, event?: Event) {
    if (event) event.stopPropagation();
    
    await this.imageService.incrementUsage(color.id);

    const selectedFinish = this.selectedFinishes[color.id.toString()] || (color.finishes && color.finishes[0]) || 'matte';
    
    this.router.navigate(['/visualizer'], {
      state: {
        color: color,
        finish: selectedFinish.toLowerCase(),
        cameFromColorsPage: true
      }
    });
  }

  async selectRelatedShade(shade: AppColor) {
    this.selectedModalColor = shade;
    this.isLoadingRecommendations = true;
    this.recommendedColors = await this.imageService.getRecommendations(shade.id);
    this.isLoadingRecommendations = false;
  }

  addToCart(color: AppColor) {
    const finish = this.selectedFinishes[color.id.toString()] || (color.finishes && color.finishes[0]) || 'Matte';
    
    this.cartService.addToCart({
      productId: color.id.toString(),
      name: color.name,
      colorCode: color.colorCode || '',
      hexCode: color.hex,
      finish: finish,
      quantity: this.modalQuantity,
      price: color.pricePerUnit || 250
    });
    
    // Open the cart popup
    this.cartService.openCart();
    
    this.toastMessage = `${this.modalQuantity}x ${color.name} added to cart.`;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
    
    this.closeModal();
  }

  buyNow(color: AppColor) {
    const action = () => {
      const finish = this.selectedFinishes[color.id.toString()] || (color.finishes && color.finishes[0]) || 'Matte';
      const price = color.pricePerUnit || 250;
      
      this.orderService.setTempCheckoutItems([{
        id: color.id.toString(),
        productId: color.id.toString(),
        name: color.name,
        colorName: color.name,
        colorCode: color.colorCode || '',
        hexCode: color.hex,
        finish: finish,
        quantity: this.modalQuantity,
        price: price,
        subtotal: price * this.modalQuantity
      }]);
      
      this.router.navigate(['/checkout']);
      this.closeModal();
    };

    this.authService.requireLogin(action);
  }

  increaseQuantity() {
    this.modalQuantity++;
  }

  decreaseQuantity() {
    if (this.modalQuantity > 1) {
      this.modalQuantity--;
    }
  }

  get modalSubtotal(): number {
    if (!this.selectedModalColor) return 0;
    const price = this.selectedModalColor.pricePerUnit || 250;
    return price * this.modalQuantity;
  }

  onRoomImageUpload(event: Event, color: AppColor) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      
      const action = () => {
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            this.imageService.setImage(e.target.result);
            const selectedFinish = this.selectedFinishes[color.id.toString()] || (color.finishes && color.finishes[0]) || 'matte';
            
            this.router.navigate(['/visualizer'], {
              state: {
                color: color,
                finish: selectedFinish.toLowerCase(),
                cameFromColorsPage: true
              }
            });
            this.closeModal();
          }
        };
        reader.readAsDataURL(file);
      };

      this.authService.requireLogin(action);
    }
  }

  // --- FIND MY COLOR WIZARD ---
  openWizard() {
    this.isWizardOpen = true;
    this.wizardStep = 1;
    this.wizardAnswers = { room: '', mood: '', tone: '' };
    this.wizardRecommendations = [];
  }

  closeWizard() {
    this.isWizardOpen = false;
  }

  setWizardAnswer(key: 'room' | 'mood' | 'tone', value: string) {
    this.wizardAnswers[key] = value;
  }

  nextWizardStep() {
    if (this.wizardStep < 3) this.wizardStep++;
    else this.generateWizardRecommendations();
  }

  generateWizardRecommendations() {
    // Simple logic based on answers
    let pool = [...this.allColors];
    
    if (this.wizardAnswers.room) {
      pool = pool.filter(c => c.rooms && c.rooms.includes(this.wizardAnswers.room));
    }
    if (this.wizardAnswers.tone && this.wizardAnswers.tone !== 'No Preference') {
      pool = pool.filter(c => c.tone === this.wizardAnswers.tone);
    }
    if (this.wizardAnswers.mood) {
      const m = this.wizardAnswers.mood;
      if (m === 'Calm') pool = pool.filter(c => c.temperature === 'Cool' || c.family === 'Blue' || c.family === 'Green');
      if (m === 'Energetic') pool = pool.filter(c => c.temperature === 'Warm' || c.temperature === 'Accent');
      if (m === 'Minimal') pool = pool.filter(c => c.temperature === 'Neutral' || c.family === 'White' || c.family === 'Grey');
      if (m === 'Luxury') pool = pool.filter(c => c.tone === 'Dark' || c.family === 'Purple');
      if (m === 'Natural') pool = pool.filter(c => c.family === 'Green' || c.family === 'Brown');
      if (m === 'Cozy') pool = pool.filter(c => c.temperature === 'Warm' && c.tone !== 'Light');
    }

    // Sort by popularity and pick top 6. If not enough, fill with popular colors.
    pool.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    
    if (pool.length < 6) {
      const extras = [...this.allColors].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)).filter(c => !pool.find(p => p.id === c.id));
      pool = [...pool, ...extras].slice(0, 6);
    } else {
      pool = pool.slice(0, 6);
    }

    this.wizardRecommendations = pool;
    this.wizardStep = 4; // Results view
  }
}
