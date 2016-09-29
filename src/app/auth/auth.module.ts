import { NgModule } from '@angular/core';

import { AuthComponent } from './auth.component';
import { AppSharedModule } from '../shared/shared.module';
import { ForgotPasswordModule } from './forgot-password/forgot-password.module';
import { ResetPasswordModule } from './reset-password/reset-password.module';
import { LoginModule } from './login/login.module';
import { SignupModule } from './signup/signup.module';
import { ForgotPasswordCongratsModule } from './forgot-password-congrats/forgot-password-congrats.module';

@NgModule({
  declarations: [
    AuthComponent,
  ],
  imports: [
    AppSharedModule,
    
    ForgotPasswordModule,
    ResetPasswordModule,
    LoginModule,
    SignupModule,
    ForgotPasswordCongratsModule
  ],
  providers: []
})
export class AuthModule {
}