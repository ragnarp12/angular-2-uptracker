import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

import { UserService } from './core/services/index';

@Injectable()
export class GetSelfDataResolve implements Resolve<any> {
  constructor(
      private userService: UserService
  ) {

  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // TODO: remove when test
    // if (!this.userService.isGuest() && !this.userService.selfData) {
    //   return this.userService.loadSelfData();
    // } else {
    //   return this.userService.selfData || null;
    // }

    return this.userService.getSelfData();
  }
}

// an array of services to resolve routes with data
export const APP_RESOLVER_PROVIDERS = [
  GetSelfDataResolve
];