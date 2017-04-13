import { ModelService } from "../../overrides/model.service";
import { Injectable, Injector } from "@angular/core";
import { Subscribers } from "../../decorators/subscribers.decorator";
import { Restangular } from "ng2-restangular";
import { APP_CONFIG, AppConfig } from "../../app.config";
import { Observable, BehaviorSubject } from "rxjs";
import * as _ from 'lodash';
import { UserService } from "./user.service";
import { AccountService } from "./account.service";

@Injectable()
@Subscribers({
  initFunc: 'onInit',
  destroyFunc: null,
})
export class OrderService extends ModelService {
  public appConfig: AppConfig;
  public ordersPreview$: any = new BehaviorSubject([]);
  constructor(
    public injector: Injector,
    public restangular: Restangular,
    public userService: UserService,
    public accountService: AccountService
  ) {
    super(restangular);
    this.appConfig = injector.get(APP_CONFIG);
  }

  getOrder(orderId:string) {
    return this.restangular.one('orders',orderId).all('preview').customGET('')
    .map((res: any) => {
          return res.data;
        })
    .do((res: any) => {
      this.updateCollection$.next(res);
    });
  }
  
}