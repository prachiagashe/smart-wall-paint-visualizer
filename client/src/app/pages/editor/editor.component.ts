import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  activeTool: 'select' | 'brush' | 'polygon' | 'eraser' = 'brush';
  brushSize: number = 90;
  imageUrl: string | ArrayBuffer = 'assets/images/hero-room.png';

  constructor(private imageService: ImageService, private router: Router) {}

  ngOnInit() {
    const savedImg = this.imageService.getImage();
    if (savedImg) {
      this.imageUrl = savedImg;
    }
  }

  setTool(tool: 'select' | 'brush' | 'polygon' | 'eraser') {
    this.activeTool = tool;
  }

  goToVisualizer() {
    // Simulate drawing a polygon mask for the back wall
    // This assumes the hero-room.png which has a distinct back wall.
    // Coordinates are percentages (0-100) to be responsive.
    const samplePolygon = [
      { x: 30, y: 20 },
      { x: 80, y: 20 },
      { x: 80, y: 70 },
      { x: 30, y: 70 }
    ];
    this.imageService.setPolygon(samplePolygon);
    this.router.navigate(['/visualizer']);
  }
}
