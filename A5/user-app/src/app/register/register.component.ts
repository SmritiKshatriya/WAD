import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  imports: [FormsModule],
})
export class RegisterComponent {

  user: any = {};

  constructor(private userService: UserService, private router: Router) {}

  registerUser() {
    this.userService.register(this.user);
    alert('Registration Successful');
    this.router.navigate(['/login']);
  }
}