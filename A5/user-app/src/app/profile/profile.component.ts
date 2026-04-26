import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';   // ✅ ADD THIS
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],   // ✅ ADD THIS
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  user: any;

  constructor(private service: UserService, private router: Router) {}

  ngOnInit() {
    this.user = this.service.getCurrentUser();
  }

  logout() {
    this.service.logout();
    this.router.navigate(['/login']);
  }
}