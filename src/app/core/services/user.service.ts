import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorage } from 'angular2-local-storage/local_storage';
import { CookieService } from 'angular2-cookie/services';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { HttpClient } from './http.service';
import { ToasterService } from './toaster.service';
import { APP_CONFIG } from '../../app.config';
import { ModelService } from '../../overrides/model.service';

@Injectable()
export class UserService extends ModelService {
  
  // static STATUS_BLOCKED = 0;
  // static STATUS_ACTIVE = 1;
  //
  // static ROLE_USER = 3;
  // static ROLE_OWNER = 2;
  // static ROLE_ADMIN = 1;
  //
  // static TYPE_AUTHENTICATION_DEFAULT = 1;
  // static TYPE_AUTHENTICATION_SMS = 2;

  selfData: any;
  selfData$: Observable<any>;
  updateSelfData$: Subject<any> = new Subject<any>();

  // apiEndpoint: string = 'http://uptracker-api.herokuapp.com/api/v1';
  // apiEndpoint: string = 'http://private-anon-ce8323ff87-uptracker.apiary-mock.com/api/v1';
  
  constructor(
    public http: HttpClient,
    public toasterService: ToasterService,
    @Inject(APP_CONFIG) appConfig,
    public localStorage: LocalStorage,
    public cookieService: CookieService,
    public router: Router
  ) {
    super({
      childClassName: UserService.name,
      modelEndpoint: '',
      expand: {
        default: [],
      }
    }, http, toasterService, appConfig);
    
    this.onInit();
  }
  
  onInit() {
    // this.selfDataActions();
    // this.addSubscribers();
  }
  
  // addSubscribers(){
  //   this.entity$.subscribe((res)=> {
  //     this.updateSelfData$.next(res);
  //   });
  // }
  //
  // selfDataActions() {
  //   this.selfData$ = Observable.merge(
  //     this.updateSelfData$
  //   )
  //   .filter(res=>{
  //     return !this.localStorage.get('selfId') || res.id == this.localStorage.get('selfId');
  //   })
  //   .publishReplay(1).refCount();
  //   this.selfData$.subscribe(res=> {
  //     //Set token
  //     if (res['accessToken']) {
  //       this.localStorage.set('token', res['accessToken']);
  //       this.localStorage.set('selfId', res['id']);
  //     }
  //     this.selfData = res;
  //     console.log(`${this.defaultOptions.childClassName} Update SELF DATA`, res);
  //   });
  // }

  // isGuest():boolean {
  //   return !this.localStorage.get('token');
  // }
  //
  // logout() {
  //   this.localStorage.set('token', '');
  //   this.localStorage.set('selfId', '');
  //   this.router.navigate(['/']);
  // }
  //
  // getToken():any {
  //   if (this.isGuest()) {
  //     return null;
  //   }
  //   return this.localStorage.get('token') || null;
  // }
  //
  // getSelfId():any {
  //   if (this.isGuest()) {
  //     return null;
  //   }
  //   return this.localStorage.get('selfId')
  // }
  //
  // loadSelfData():Observable<any> {
  //   if (this.isGuest()) {
  //     return Observable.of(null);
  //   }
  //
  //   this.loadEntity({id: this.getSelfId()});
  //
  //   return this.selfData$;
  // }
  //
  // updateSelfData(data){
  //   this.updateSelfData$.next(data);
  // }
  
  login(data) {
    let body = JSON.stringify(data);
    // body['email_address'] = body['email'];
    let api = this.apiEndpoint + 'login';
    return this.http.post(api, body, {
      search: this.getSearchParams('login')
    })
      .map(this.extractData.bind(this))
      .catch(this.handleError.bind(this))
      .do((res) => {
        this.afterLogin(res);
      });
  }
  
  afterLogin(data){
    this.localStorage.set('uptracker_token', '');
    this.localStorage.set('uptracker_selfId', '');
    this.cookieService.put('uptracker_token', '');
    this.cookieService.put('uptracker_selfId', '');
    // this.updateSelfData$.next(data);
  }

  // signUp(data){
  //   let entity = super.create(data);
  //
  //   entity.subscribe(res=>{
  //     this.updateSelfData$.next(res);
  //   });
  //
  //   return entity;
  // }
  //
  // updatePasswordRequest(data?) {
  //   return this.http.post(`${this.apiEndpoint}/update-password-request`, data)
  //   .map(this.extractData.bind(this))
  //   .catch(this.handleError.bind(this))
  // }
  //
  // updatePassword(data) {
  //   return this.http.post(`${this.apiEndpoint}/update-password`, data)
  //   .map(this.extractData.bind(this))
  //   .catch(this.handleError.bind(this))
  //   .do((res)=> {
  //     this.updateSelfData$.next(res);
  //   });
  // }
  //
  // verification(data) {
  //   let body = JSON.stringify(data);
  //
  //   return this.http.post(`${this.apiEndpoint}/verification`, body, {
  //     search: this.getSearchParams('login')
  //   })
  //   .map(this.extractData.bind(this))
  //   .catch(this.handleError.bind(this))
  //   .do((res)=> {
  //     this.updateSelfData$.next(res);
  //   });
  // }
  //
  // smsRequest(data) {
  //   let body = JSON.stringify(data);
  //
  //   return this.http.post(`${this.apiEndpoint}/sms-request`, body)
  //   .map(this.extractData.bind(this))
  //   .catch(this.handleError.bind(this))
  //   .do((res)=> {
  //     this.toasterService.pop('success', 'SMS sent to your phone');
  //     this.updateSelfData$.next(res);
  //   });
  // }
  //
  // smsLogin(data) {
  //   let body = JSON.stringify(Object.assign({}, data, {idUser: this.selfData.id}));
  //
  //   return this.http.post(`${this.apiEndpoint}/sms-login`, body, {
  //     search: this.getSearchParams('login')
  //   })
  //   .map(this.extractData.bind(this))
  //   .catch(this.handleError.bind(this))
  //   .do((res)=> {
  //     this.updateSelfData$.next(res);
  //   });
  // }
  //
  // handleError(error:any) {
  //   if (error.status == 401 || error.status == 404) {
  //     this.logout();
  //   }
  //
  //   let body = JSON.parse(error._body);
  //   let errMsg = body.length ? body[0].message : body.message;
  //
  //   this.toasterService.pop('error', errMsg);
  //
  //   return Observable.throw(errMsg);
  // }
}