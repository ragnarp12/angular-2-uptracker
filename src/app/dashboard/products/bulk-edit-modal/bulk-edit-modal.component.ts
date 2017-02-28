import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { DialogRef, ModalComponent, CloseGuard } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DestroySubscribers } from 'ng2-destroy-subscribers';
import * as _ from 'lodash';

import { AccountService, UserService } from '../../../core/services/index';
import { AccountVendorModel } from '../../../models/index';

export class EditProductModalContext extends BSModalContext {
    public product: any;
}

@Component({
    selector: 'app-edit-product-modal',
    //TODO: [ngClass] here on purpose, no real use, just to show how to workaround ng2 issue #4330.
    // Remove when solved.
    /* tslint:disable */
    templateUrl: './bulk-edit-modal.component.html',
    styleUrls: ['./bulk-edit-modal.component.scss']
})
@DestroySubscribers()
export class BulkEditModal implements OnInit, AfterViewInit, CloseGuard, ModalComponent<EditProductModalContext> {
    private subscribers: any = {};
    private context: EditProductModalContext;
    public product: AccountVendorModel;
    
    public bulk:any = {
    };
    
    constructor(
      public dialog: DialogRef<EditProductModalContext>,
      private userService: UserService,
      private accountService: AccountService
    ) {
        this.context = dialog.context;
        dialog.setCloseGuard(this);
    }
    
    ngOnInit(){
    }
    
    ngAfterViewInit(){
    }
    
    dismissModal(){
        this.dialog.dismiss();
    }
    
    closeModal(data){
        this.dialog.close(data);
    }
    
    onSubmit(){
        
    }
}
