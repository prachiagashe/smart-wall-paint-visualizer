import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  // Using the available hero-room.png as placeholder for the sample room thumbnails
  sampleImages = [
    'assets/images/hero-room.png',
    'assets/images/hero-room.png',
    'assets/images/hero-room.png',
    'assets/images/hero-room.png'
  ];
}
