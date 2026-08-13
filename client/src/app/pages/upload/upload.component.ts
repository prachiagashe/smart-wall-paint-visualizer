import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  uploadedImageUrl: string | ArrayBuffer | null = null;

  // Using the available hero-room.png as placeholder for the sample room thumbnails
  sampleImages = [
    'assets/images/hero-room.png',
    'assets/images/hero-room.png',
    'assets/images/hero-room.png',
    'assets/images/hero-room.png'
  ];

  constructor(private imageService: ImageService, private router: Router) {}

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = e => this.uploadedImageUrl = reader.result;
      reader.readAsDataURL(file);
    }
  }

  selectSampleImage(imgUrl: string) {
    this.uploadedImageUrl = imgUrl;
  }

  clearImage() {
    this.uploadedImageUrl = null;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  goToEditor() {
    if (this.uploadedImageUrl) {
      this.imageService.setImage(this.uploadedImageUrl);
      this.router.navigate(['/editor']);
    }
  }
}
