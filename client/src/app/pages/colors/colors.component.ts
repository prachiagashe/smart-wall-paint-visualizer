import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Color {
  name: string;
  hex: string;
  category: string;
  finishes: string[];
  description: string;
}

@Component({
  selector: 'app-colors',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './colors.component.html',
  styleUrls: ['./colors.component.scss']
})
export class ColorsComponent {
  searchQuery: string = '';
  activeFilter: string = 'All';

  filters = ['All', 'Warm', 'Cool', 'Neutral', 'Accent', 'Living Room', 'Bedroom', 'Modern'];

  allColors: Color[] = [
    {
      name: 'Ocean Breeze',
      hex: '#8FA9B8',
      category: 'Cool',
      finishes: ['Matte', 'Satin', 'Glossy'],
      description: 'A calm coastal blue-grey that opens up compact rooms.'
    },
    {
      name: 'Sage Green',
      hex: '#879C76',
      category: 'Cool',
      finishes: ['Matte', 'Satin'],
      description: 'Muted botanical green — our most saved accent wall shade.'
    },
    {
      name: 'Warm Beige',
      hex: '#D9C7AE',
      category: 'Warm',
      finishes: ['Matte', 'Satin'],
      description: 'A soft sand neutral that flatters warm evening lighting.'
    },
    {
      name: 'Soft Grey',
      hex: '#BFBFBA',
      category: 'Neutral',
      finishes: ['Matte', 'Satin', 'Glossy'],
      description: 'Balanced grey with a whisper of green for softer shadows.'
    },
    {
      name: 'Terracotta',
      hex: '#B5674A',
      category: 'Accent',
      finishes: ['Matte', 'Satin'],
      description: 'Earthy baked-clay tone for a confident feature wall.'
    },
    {
      name: 'Dusty Blue',
      hex: '#7E93A8',
      category: 'Cool',
      finishes: ['Matte', 'Satin'],
      description: 'Quiet denim blue that pairs beautifully with oak furniture.'
    },
    {
      name: 'Ivory',
      hex: '#F2EADF',
      category: 'Neutral',
      finishes: ['Matte', 'Satin', 'Glossy'],
      description: 'Creamy off-white base shade for bright, airy interiors.'
    },
    {
      name: 'Forest Green',
      hex: '#3F5D4A',
      category: 'Accent',
      finishes: ['Matte', 'Satin'],
      description: 'Deep, library-inspired green for dramatic accent walls.'
    },
    {
      name: 'Clay Rose',
      hex: '#C79C93',
      category: 'Warm',
      finishes: ['Matte', 'Satin'],
      description: 'Dusty pink with a clay undertone — warm without being sweet.'
    },
    {
      name: 'Charcoal Slate',
      hex: '#4A4E52',
      category: 'Neutral',
      finishes: ['Matte', 'Satin', 'Glossy'],
      description: 'Architectural dark grey for media walls and studies.'
    },
    {
      name: 'Mustard Linen',
      hex: '#C99A48',
      category: 'Accent',
      finishes: ['Matte', 'Satin'],
      description: 'Golden ochre that turns hallway walls into a highlight.'
    },
    {
      name: 'Morning Mist',
      hex: '#DCE3E1',
      category: 'Cool',
      finishes: ['Matte', 'Satin', 'Glossy'],
      description: 'Pale mineral tint that keeps small rooms feeling open.'
    }
  ];

  get filteredColors(): Color[] {
    let filtered = this.allColors;

    if (this.activeFilter !== 'All') {
      // Filter by category or if it's a room tag, we just fake it by showing a subset
      if (['Warm', 'Cool', 'Neutral', 'Accent'].includes(this.activeFilter)) {
        filtered = filtered.filter(c => c.category === this.activeFilter);
      } else {
        // Fake subset for "Living Room", "Bedroom", "Modern"
        filtered = filtered.slice(0, 5); 
      }
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.hex.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
  }
}
