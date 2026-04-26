import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { Router, RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [FormsModule, RouterModule],
})

export class LoginComponent {
  loginData: any = {};

  constructor(private service: UserService, private router: Router) {}

  loginUser() {
    const user = this.service.login(this.loginData);

    if (user) {
      this.service.setCurrentUser(user);
      alert('Login Successful');
      this.router.navigate(['/profile']);
    } else {
      alert('Invalid Credentials');
    }
  }
}