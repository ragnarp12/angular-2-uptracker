import { Injectable } from '@angular/core';

import { LocalStorage } from 'angular2-local-storage/local_storage';
import { CookieService } from 'angular2-cookie/services';

@Injectable()
export class SessionService {
  public session: any = {};
  
  constructor(
      private localStorage: LocalStorage,
      private cookieService: CookieService
  ) {
  }

  set(title, value){
    try{
      this.localStorage.set(title, value);
    } catch(err){
      if (!this.cookieService.put(title, value)) {
        this.session[title] = value;
      }
    }
  }

  get(title){
    let value;
    try{
      value =  this.localStorage.get(title);
    } catch(err){
      value = this.cookieService.get(title) || this.session[title];
    }
    return value;
  }

  remove(title){
    try{
      this.localStorage.remove(title);
    } catch(err){
      if (!this.cookieService.remove(title)){
        this.session[title] = null;
      }
    }
  }
  
}