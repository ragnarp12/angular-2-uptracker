import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Restangular } from 'ng2-restangular';

import { ModelService } from '../../overrides/model.service';
import { Subscribers } from '../../decorators/subscribers.decorator';
import { SpinnerService } from './spinner.service';
import { SessionService } from './session.service';

@Injectable()
@Subscribers({
  initFunc: 'onInit',
  destroyFunc: null
})
export class UserService extends ModelService {
  selfData: any;
  selfData$: Observable<any>;
  updateSelfData$: Subject<any> = new Subject<any>();
  
  redirectUrl: string = null; //url for auth guard to redirect
  session: any = {};

  constructor(
    public injector: Injector,
    public sessionService: SessionService,
    public router: Router,
    public spinnerService: SpinnerService,
    public restangular: Restangular
  ) {
    super(restangular);
    
    this.onInit();
  }
  
  onInit() {
    this.selfDataActions();
  }

  getSessionId(){
    return this.sessionService.get('uptracker_selfId');
  }

  getSessionToken(){
    return this.sessionService.get('uptracker_token');
  }
  
  setSessionId(id) {
    this.sessionService.set('uptracker_selfId', id);
  }

  setSessionToken(token){
    this.sessionService.set('uptracker_token', token);
  }

  getSelfId(): any {
    if (this.isGuest()) {
      return null;
    }
    return this.getSessionId() || null;
  }

  // for signup pages
  getSelfIdFromSelfData(): any {
    return this.selfData ? this.selfData.id || null : null;
  }
  
  addSubscribers(){
    this.entity$.subscribe((res) => {
      this.updateSelfData$.next(res);
    });
  }

  selfDataActions() {
    this.selfData$ = Observable.merge(
      this.updateSelfData$
    )
    .filter((res: any) => { 
      let condition = !this.getSessionId() || res.id == this.getSessionId();
      return condition;
    })
    .publishReplay(1).refCount();

    this.selfData$.subscribe((res: any) => {
      //Set token
      if (res['token'] && !res['signup']) {
        this.setSessionId(res['id']);
        this.setSessionToken(res['token']);
      }
      this.selfData = res;
      console.log(`${this.constructor.name} Update SELF DATA`, res);
    });
  }

  isGuest(): boolean {
    return !this.getSessionId() || !this.getSessionToken();
  }

  logout(redirectUrl = '/') { 
    let data = {
      user_id: this.getSessionId()
    };
    return this.restangular.all('logout').post(data)
        .do((res) => {
          UserService.logout(this.sessionService, this.router, redirectUrl);
          this.updateSelfData({});
        });
  }
  static logout(sessionService, router, redirectUrl = '/') {
    sessionService.remove('uptracker_token');
    sessionService.remove('uptracker_selfId');
    router.navigate([redirectUrl]);
  }

  loadSelfData(): Observable<any> {
    if (this.isGuest()) {
      return Observable.of(null);
    }

    if (this.selfData && this.selfData != {}) {
      return this.selfData$;
    }

    return this.loadEntity({id: this.getSelfId()});
  }

  loadEntity(data: any = null){
    let entity = this.restangular.one('users', data.id).get();
    
    entity.subscribe((res: any) => { 
      let user = this.transformAccountInfo(res.data);
      this.updateEntity$.next(user);
    });
    
    return entity;
  }

  updateSelfData(data){
    this.updateSelfData$.next(data);
  }
  
  login(data) {
    return this.restangular.all('login').post(data)
      .do((res) => {
        this.afterLogin(res);
      });
  }
  
  afterLogin(data){ 
    data.data.user.user.token = data.data.user.token;
    let user = this.transformAccountInfo(data.data.user);

    this.updateSelfData(user);
    this.addToCollection$.next(user);
  }

  signUp(data){
    return this.restangular.all('register').all('user').post(data)
        .do(
          (res: any) => {
            // for SelfDataActions to avoid putting user_id in cookies (for isGuest functionality)
            // res.data.user.signup = true;
            res.data.user.token = res.data.token;
            let user = this.transformAccountInfo(res.data);

            this.addToCollection$.next(user);
            this.updateSelfData$.next(user);
          }
        );
  }

  forgotPasswordRequest(data) {
    return this.restangular.all('forgot').post(data).take(1);
  }

  forgotPasswordTokenValidation(token) {
    return this.restangular.one('forgot', token).get().take(1);
  }

  updatePassword(data) {
    return this.restangular.all('passwordreset').post(data).take(1);
  }

  verification(token) {
    return this.restangular.all('register').one('verify', token).get()
      .do((res)=> {
        let user = this.transformAccountInfo(res.data);
        this.updateSelfData(user);
      })
      .take(1);
  }

  resendVerification() {
    let data = {
      user_id: this.getSelfId()
    };
    return this.restangular.all('register').all('verify').all('resend').post(data).take(1);
  }
  
  emailVerified(){
    // version without observables
    let emailVerified = this.selfData ? this.selfData.email_verified || false : false;
    return emailVerified;
  }

  transformAccountInfo(data){
    data.user.account = data.account || null;
    return data.user;
  }

  currentSignupStep(){
    if (!this.getSelfIdFromSelfData()) {
      return 1;
    }

    let user = this.selfData;
    if (user.email_verified) {
      return null;
    }
    if (!user.account) {
      return 2;
    }
    if (user.account) {
      let payment_token = user.account.payment_token || null;
      let trial_code = user.account.trial_code || null;
      if (!payment_token && !trial_code) {
        return 3;
      }
    }

    // if all steps are passed then user didn't verify email
    return 4;
  }
  
  updateSelfDataField(field, data){
    let user = this.selfData;
    user[field] = data;
    this.updateSelfData(user);
  }

  updateSelfDataAccountField(field, data){
    if (this.selfData.account){
      let account = this.selfData.account;
      account[field] = data;
      this.updateSelfDataField('account', account);
    }
  }
}