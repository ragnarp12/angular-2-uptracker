import { Injectable, Injector } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';

import { ModelService } from '../../overrides/model.service';
import { UserService } from './user.service';
import { AccountService } from './account.service';
import { Subscribers } from '../../decorators/subscribers.decorator';
import { VendorResource } from '../../core/resources/index';
import { VendorModel, AccountVendorModel } from '../../models/index';
import { Restangular } from 'ng2-restangular';

@Injectable()
@Subscribers({
  initFunc: 'onInit',
  destroyFunc: null,
})
export class VendorService extends ModelService {
  selfData: any;
  selfData$: Observable<any>;
  updateSelfData$: Subject<any> = new Subject<any>();
  combinedVendors$: Observable<any>;


  constructor(
      public injector: Injector,
      public vendorResource: VendorResource,
      public userService: UserService,
      public accountService: AccountService,
      public restangular: Restangular
  ) {
    super(injector, vendorResource);

    // combine global vendors observable with account vendors from account observable
    this.combinedVendors$ = Observable
        .combineLatest(
            this.collection$,
            this.userService.selfData$
        )
        .map(([vendors, user]) => { 
          let accountVendors = user.account.vendors;
          // find and combine vendors
          let commonVendors = _.map(vendors, (globalVendor: any) => {
            globalVendor = new VendorModel(globalVendor);
            _.each(accountVendors, (accountVendor: AccountVendorModel) => {
              if (accountVendor.vendor_id == globalVendor.id){
                globalVendor.account_vendor = accountVendor;
                globalVendor.priority = accountVendor.priority;
              }
            });
            return globalVendor;
          });
          return commonVendors;
        })
        .publishReplay(1).refCount();

    this.onInit();
  }

  onInit(){
    this.selfData$ = Observable.merge(
        this.updateSelfData$
    );
    this.selfData$.subscribe((res) => {
      this.selfData = res;
      console.log(`${this.constructor.name} Update SELF DATA`, res);

      //update user after update account
      this.userService.updateSelfDataField('account', this.selfData);
    });
  }

  addSubscribers(){
    this.entity$.subscribe((res) => {
      this.updateSelfData(res);
    });
  }

  updateSelfData(data){
    this.updateSelfData$.next(data);
  }

  getVendors(){
    let vendorsLoaded = this.selfData ? this.selfData.length : false;
    if (!vendorsLoaded) {
      return this.resource.getVendors().$observable
          .map((res: any) => {
            return res.data.vendors;
          })
          .do((res: any) => {
            this.updateCollection$.next(res);
          });
    }
  }

  getVendor(id){
    let data = {
      id: id
    };
    return this.resource.getVendor(data).$observable;
  }

  searchVendor(query){
    let data = {
      query: query
    };
    return this.resource.searchVendors(data).$observable;
  }

  getAccountVendors(){
    let data: any = {
      account_id: this.userService.selfData.account_id
    };
    let vendorsLoaded = this.userService.selfData.account.vendors ? this.userService.selfData.account.vendors.length : false;
    if (!vendorsLoaded) {
      return this.resource.getAccountVendors(data).$observable.do((res: any) => {
        let account = this.userService.selfData.account;
        account.vendors = res.data.vendors;
        this.accountService.updateSelfData(account);
      });
    }
  }

  addAccountVendor(data){ console.log(111, data.get('id'));
    let account = this.userService.selfData.account;
    debugger;
    let entity$ = this.restangular
        .one('accounts', data.get('account_id'))
        .all('vendors')
        .customPOST(data, undefined, undefined, { 'Content-Type': undefined });
    return entity$.do((res: any) => { debugger;
      account.vendors.push(res.data.vendor);
      this.accountService.updateSelfData(account);
    });


    // TODO: remove after testing
    // return this.resource.addAccountVendor(data).$observable.do((res: any) => {
    //   account.vendors.push(res.data.vendor);
    //   this.accountService.updateSelfData(account);
    // });
  }

  editAccountVendor(data){ 
    let editVendor = data.get('id');
    let account = this.userService.selfData.account;
    // if no id then add new vendor
    if (!editVendor) {
      return this.addAccountVendor(data);
    } else { debugger;
      let entity$ = this.restangular
          .one('accounts', data.get('account_id'))
          .one('vendors', data.get('id'))
          .customPUT(data, undefined, undefined, { 'Content-Type': undefined });
      return entity$.do((res: any) => { debugger;
        console.log(111, res.data.vendor);
        let vendorArr = _.map(account.vendors, function(vendor){
          if (vendor['id'] == res.data.vendor.id) {
            return res.data.vendor;
          } else {
            return vendor;
          }
        });
        account.vendors = vendorArr;
        this.accountService.updateSelfData(account);
      });
    }


    // TODO: Remove after testing restangular
    // return this.resource.editAccountVendor(data).$observable.do((res: any) => {
    //   // if (account.vendors && _.some(account.vendors, {'id': res.data.vendor.id})){
    //   let vendorArr = _.map(account.vendors, function(vendor){
    //     if (vendor['id'] == res.data.vendor.id) {
    //       return res.data.vendor;
    //     } else {
    //       return vendor;
    //     }
    //   });
    //   account.vendors = vendorArr;
    //   // }
    //   this.accountService.updateSelfData(account);
    // });
  }
}