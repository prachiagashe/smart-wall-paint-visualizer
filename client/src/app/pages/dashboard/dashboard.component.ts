import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  sliderPosition = 50;

  selectedHeroColor = '#879C76'; // Default Sage Green
  selectedSliderColor = '#8FA9B8'; // Default Ocean Breeze

  heroColors = [
    { name: 'Sage Green', hex: '#879C76' },
    { name: 'Terracotta', hex: '#B96545' },
    { name: 'Dusty Blue', hex: '#8199AD' },
    { name: 'Warm Beige', hex: '#D8C6A8' },
    { name: 'Forest Green', hex: '#3F604F' }
  ];

  selectHeroColor(hex: string) {
    this.selectedHeroColor = hex;
  }

  selectSliderColor(hex: string) {
    this.selectedSliderColor = hex;
  }

  colors = [
    { name: 'Ocean Breeze', hex: '#8FA9B8', category: 'Cool', bg: '#8FA9B8' },
    { name: 'Sage Green', hex: '#879C76', category: 'Cool', bg: '#879C76' },
    { name: 'Warm Beige', hex: '#D9C7AE', category: 'Warm', bg: '#D9C7AE' },
    { name: 'Soft Grey', hex: '#BFBFBA', category: 'Neutral', bg: '#BFBFBA' },
    { name: 'Terracotta', hex: '#B5674A', category: 'Accent', bg: '#B5674A' },
    { name: 'Dusty Blue', hex: '#7E93A8', category: 'Cool', bg: '#7E93A8' },
    { name: 'Ivory', hex: '#F2EADF', category: 'Neutral', bg: '#F2EADF' },
    { name: 'Forest Green', hex: '#3F5D4A', category: 'Accent', bg: '#3F5D4A' },
  ];

  constructor() {}

  ngOnInit(): void {}

  onSliderInput(event: any) {
    this.sliderPosition = event.target.value;
  }
}
