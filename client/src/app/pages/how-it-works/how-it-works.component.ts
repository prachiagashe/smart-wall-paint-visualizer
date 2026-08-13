import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss']
})
export class HowItWorksComponent {
  faqs = [
    {
      question: 'Do I need special equipment to get a good preview?',
      answer: 'No, a standard smartphone camera works perfectly. Just ensure your room is well-lit and you take a straight-on shot of the wall you want to paint.',
      isOpen: false
    },
    {
      question: 'Is the color accurate to the real paint?',
      answer: 'We calibrate our digital colors to match real-world paint swatches as closely as possible. However, your screen settings and natural room lighting will affect how the paint looks in reality.',
      isOpen: false
    },
    {
      question: 'Does SmartPaint detect walls automatically?',
      answer: 'Currently, you manually trace the wall using our easy-to-use polygon or brush tool. This ensures perfect accuracy around furniture, windows, and plants.',
      isOpen: false
    },
    {
      question: 'Where are my designs stored?',
      answer: 'Your saved projects and color comparisons are stored securely in your account dashboard, accessible anytime you log in.',
      isOpen: false
    }
  ];

  toggleFaq(index: number) {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}
