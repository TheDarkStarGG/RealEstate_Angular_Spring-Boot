import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; // ✅ thêm cả FormsModule
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

@NgModule({
  declarations: [LoginComponent, RegisterComponent],
  imports: [
    CommonModule,
    FormsModule, // ✅ dùng cho ngClass, ngModel nếu có
    ReactiveFormsModule, // ✅ dùng cho formGroup, formControlName
  ],
})
export class AuthModule {}
