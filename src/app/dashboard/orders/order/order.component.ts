import { Component, OnInit } from '@angular/core';
import { Location }                 from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs/Rx';


import { Modal } from 'angular2-modal/plugins/bootstrap';
import { DestroySubscribers } from 'ng2-destroy-subscribers';
import * as _ from 'lodash';

import { ModalWindowService } from "../../../core/services/modal-window.service";
import { UserService } from '../../../core/services/user.service';
import { AccountService } from '../../../core/services/account.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { PastOrderService } from '../../../core/services/pastOrder.service';


@Component({
  selector: 'app-purchase-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
@DestroySubscribers()
export class OrderComponent {
  public subscribers: any = {};
  public orders$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public orderId: string;
  order$: BehaviorSubject<any> = new BehaviorSubject({});
  
  constructor(
    public modal: Modal,
    public modalWindowService: ModalWindowService,
    public userService: UserService,
    public windowLocation: Location,
    public accountService: AccountService,
    public route: ActivatedRoute,
    public pastOrderService: PastOrderService,
    public router: Router,
    public toasterService: ToasterService,
  ) {
  
  }
  
  addSubscribers() {
    
    this.subscribers.showOrderSubscription = this.route.params
    .switchMap((p: Params) => {
      this.orderId = p['id'];
      return this.pastOrderService.getPastOrder(p['id']);
    })
    .subscribe((item: any) =>
      this.order$.next(item)
    );
    
  }
  
  goBack(): void {
    this.windowLocation.back();
  }
 
}