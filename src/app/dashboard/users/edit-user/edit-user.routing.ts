import { EditUserComponent } from './edit-user.component';
export const EditUserRoutes = [
  {
    path: 'users/edit/:id',
    component: EditUserComponent,
    resolve: {
    },
    canActivate: []
  },
];