import { AuthComponent } from './auth.component';
import { AuthGuard } from '../auth-guard.service';

import { EmailVerificationRoutes } from './email-verification/email-verification.routing';

export const AuthRoutes = [
  {
    path: '',
    component: AuthComponent,
    resolve: {},
    children: [
      { path: 'signup', canLoad: [AuthGuard], loadChildren: './signup/signup.module#SignupModule' },
      { path: 'login', canLoad: [AuthGuard], loadChildren: './login/login.module#LoginModule' },
      { path: 'forgot-password', canLoad: [AuthGuard], loadChildren: './forgot-password/forgot-password.module#ForgotPasswordModule' },
      { path: 'forgot-password-congrats', loadChildren: './forgot-password-congrats/forgot-password-congrats.module#ForgotPasswordCongratsModule' },
      { path: 'reset-password/:token', loadChildren: './reset-password/reset-password.module#ResetPasswordModule' },
      ...EmailVerificationRoutes
    ]
  }
];