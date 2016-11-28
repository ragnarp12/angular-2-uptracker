import { Injectable, Injector, Inject } from '@angular/core';

import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import { isUndefined } from 'util';
import * as _ from 'lodash';
import { Restangular } from 'ng2-restangular';

import { ModelService } from '../../overrides/model.service';
import { UserService } from './user.service';
import { Subscribers } from '../../decorators/subscribers.decorator';
import { AppConfig, APP_CONFIG } from '../../app.config';

@Injectable()
@Subscribers({
  initFunc: 'onInit',
  destroyFunc: null,
})
export class AccountService extends ModelService{  
  selfData: any;
  selfData$: Observable<any>;
  updateSelfData$: Subject<any> = new Subject<any>();
  
  locationTypeCollection$ = Observable.empty();
  stateCollection$ = Observable.empty();
  currencyCollection$ = Observable.empty();
  departmentCollection$ = Observable.empty();
  roleCollection$ = Observable.empty();

  onboardAccounting: any = {
    total: [],
    budget_distribution: [],
    currency: 'USD'
  };
  locations$: Observable<any>;
  dashboardLocation$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public appConfig: AppConfig;
  
  constructor(
    public injector: Injector,
    public userService: UserService,
    public restangular: Restangular
  ) {
    super(restangular);
    this.appConfig = injector.get(APP_CONFIG);
  
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

    this.locations$ = this.userService.selfData$
        .filter(() => {
          return !this.userService.isGuest();
        })
        .map((res: any) => {
          return res.account.locations;
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

  createCompany(data){
    return this.restangular.all('register').all('company').post(data)
        .do(
          (res: any) => {
            this.addToCollection$.next(res.data.account);
            this.updateEntity$.next(res.data.account);
            this.updateSelfData(res.data.account);
          }
        );
  }

  getLocations(){
    let account = this.userService.selfData.account;
    let locationsLoaded = account ? !isUndefined(account.locations) ? true : false : false;
    if (!locationsLoaded) {
      return this.restangular.one('accounts', this.userService.selfData.account_id).all('locations').customGET('')
          .map((res: any) => {
            return res.data.locations;
          })
          .do((res: any) => {
            account.locations = res;
            this.updateSelfData(account);
          });
    } else {
      return this.userService.selfData$.map(res => res.account.locations);
    }
  }

  getStates(){
    return this.stateCollection$.isEmpty().switchMap((isEmpty) => {
      if(isEmpty) {
        this.stateCollection$ = this.restangular.all('config').all('states').customGET('')
            .map((res: any) => {
              return res.data;
            });
      }
      return this.stateCollection$;
    });
  }

  getLocationTypes(){
    return this.locationTypeCollection$.isEmpty().switchMap((isEmpty) => {
      if(isEmpty) {
        this.locationTypeCollection$ = this.restangular.all('config').all('location_types').customGET('')
            .map((res: any) => {
              return res.data;
            });
      }
      return this.locationTypeCollection$;
    });
  }

  getLocationStreetView(params: any){
    params.key = this.appConfig.streetView.apiKey;
    params.size = '520x293';
    let imageUrl = this.appConfig.streetView.endpoint+'?location='+params.location+'&size='+params.size+'&key='+params.key;
    return imageUrl.replace(/\s/g,'%20');
  }

  addLocation(data: any){
    return this.restangular.one('accounts', data.account_id).all('locations').post(data)
        .do((res: any) => {
          let account = this.userService.selfData.account;
          account.locations = res.data.account.locations;
          this.updateSelfData(account);
        });
  }

  deleteLocation(data: any){
    return this.restangular.one('accounts', this.userService.selfData.account_id).one('locations', data.id).remove()
        .do((res: any) => {
          let account = this.userService.selfData.account;
          _.remove(account.locations, (location: any) => {
            return location.id == data.id;
          });
          this.updateSelfData(account);
        });
  }

  getDepartments(){
    return this.departmentCollection$.isEmpty().switchMap((isEmpty) => {
      if(isEmpty) {
        this.departmentCollection$ = this.restangular.all('config').all('departments').customGET('')
            .map((res: any) => {
              return res.data;
            });
      }
      return this.departmentCollection$;
    });
  }

  getUsers(){
    let usersLoaded = this.userService.selfData.account.users ? this.userService.selfData.account.users[0].name : false;
    if (!usersLoaded) {
      return this.restangular.one('accounts', this.userService.selfData.account_id).all('users').customGET('')
          .map((res: any) => {
            return res.data.users;
          })
          .do((res: any) => {
            let account = this.userService.selfData.account;
            account.users = res;
            this.updateSelfData(account);
          });
    } else {
      return this.userService.selfData$.map(res => res.account.users);
    }
  }

  addUser(data){
    return this.restangular.all('users').post(data)
        .do((res: any) => {
          let account = this.userService.selfData.account;
          // if new user push him to account users array, else update user in array
          if (_.some(account.users, {'id': res.data.user.id})){
            let userArr = _.map(account.users, function(user){
              if (user['id'] == res.data.user.id) {
                return _.cloneDeep(res.data.user);
              } else {
                return user;
              }
            });
            account.users = userArr;
          } else {
            account.users.push(res.data.user);
          }

          // check if changed user self data
          if (res.data.user.id == this.userService.getSelfId()){
            let user = res.data.user;
            user.account = account;
            this.userService.updateSelfData(user);
          } else {
            this.updateSelfData(account);
          }
        });
  }

  deleteUser(data: any){
    return this.restangular.one('users', data.id).remove()
        .do((res: any) => {
          let account = this.userService.selfData.account;
          _.remove(account.users, (user: any) => {
            return user.id == data.id;
          });
          this.updateSelfData(account);
        });
  }

  putAccounting(data: any){
    return this.restangular.one('accounts', data.account_id).customPUT(data)
        .do((res: any) => {
          this.updateSelfData(res.data.account.account);
        });
  }

  getCurrencies(){
    return this.currencyCollection$.isEmpty().switchMap((isEmpty) => { 
      if (isEmpty) {
        this.currencyCollection$ = this.restangular.all('config').all('currency').customGET('')
            .map((res: any) => {
              let currencyArr = _.sortBy(res.data, 'priority');
              return currencyArr;
            });
      }
      return this.currencyCollection$;
    });
  }

  getRoles(){
    let rolesLoaded = this.userService.selfData.account.roles ? this.userService.selfData.account.roles[0].role : false;
    if (!rolesLoaded) {
      return this.restangular.one('accounts', this.userService.selfData.account_id).all('permissions').customGET('')
          .map((res: any) => {
            return res.data.roles;
          })
          .do((res: any) => {
            let account = this.userService.selfData.account;
            account.roles = res;
            this.updateSelfData(account);
          });
    } else {
      return this.userService.selfData$.map(res => res.account.roles);
    }
  }
  
  addRole(data){
    return this.restangular.one('accounts', data.account_id).all('roles').post(data)
        .do((res: any) => {
          let account = this.userService.selfData.account;
          account.roles = res.data.roles;
          this.updateSelfData(account);
        });
  }
}