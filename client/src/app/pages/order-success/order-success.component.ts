import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.scss']
})
export class OrderSuccessComponent implements OnInit {
  orderId: string | null = null;
  
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.queryParamMap.get('orderId');
  }
}
