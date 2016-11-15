import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

import { AccountService, VendorService } from '../../core/services/index';
import {Observable} from "rxjs/Rx";

@Injectable()
export class StateCollectionResolve implements Resolve<any> {
  constructor(
      private accountService: AccountService
  ) {

  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.accountService.getStates().take(1);
  }
}

@Injectable()
export class LocationTypesCollectionResolve implements Resolve<any> {
  constructor(
      private accountService: AccountService
  ) {

  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.accountService.getLocationTypes().take(1);
  }
}

@Injectable()
export class DepartmentCollectionResolve implements Resolve<any> {
  constructor(
      private accountService: AccountService
  ) {

  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.accountService.getDepartments().take(1);
  }
}

@Injectable()
export class CurrencyCollectionResolve implements Resolve<any> {
  constructor(
      private accountService: AccountService
  ) {

  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.accountService.getCurrencies();
  }
}

@Injectable()
export class VendorCollectionResolve implements Resolve<any> {
  constructor(
      private vendorService: VendorService
  ) {

  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.vendorService.getVendors().take(1);
  }
}

// an array of services to resolve routes with data
export const MAIN_RESOLVER_PROVIDERS = [
  StateCollectionResolve,
  LocationTypesCollectionResolve,
  DepartmentCollectionResolve,
  CurrencyCollectionResolve,
  VendorCollectionResolve
];