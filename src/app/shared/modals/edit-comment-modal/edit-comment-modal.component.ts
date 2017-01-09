import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';

import { DialogRef, ModalComponent, CloseGuard, Modal } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DestroySubscribers } from 'ng2-destroy-subscribers';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import * as _ from 'lodash';

import {
  UserService,
  AccountService,
  PhoneMaskService,
  ToasterService,
  FileUploadService,
  ModalWindowService
} from '../../../core/services/index';
import { UserModel } from '../../../models/index';
import { ViewUserModal } from "../../../dashboard/users/view-user-modal/view-user-modal.component";

export class EditCommentModalContext extends BSModalContext {
  public comment: any;
}

@Component({
  selector: 'app-change-password-user-modal',
  // TODO: [ngClass] here on purpose, no real use, just to show how to workaround ng2 issue #4330.
  // Remove when solved.
  /* tslint:disable */
  templateUrl: './edit-comment-modal.component.html',
  styleUrls: ['./edit-comment-modal.component.scss']
})
@DestroySubscribers()
export class EditCommentModal implements OnInit, CloseGuard, ModalComponent<EditCommentModalContext> {
  private subscribers: any = {};
  context: EditCommentModalContext;

  public comment;


  constructor(public zone: NgZone,
              public dialog: DialogRef<EditCommentModalContext>,
              private userService: UserService,
              private accountService: AccountService,
              private phoneMaskService: PhoneMaskService,
              private toasterService: ToasterService,
              private fileUploadService: FileUploadService,
              private modal: Modal,
              public modalWindowService: ModalWindowService) {
    this.context = dialog.context;
    dialog.setCloseGuard(this);
  }

  ngOnInit() {
    this.comment = this.context.comment;
  }

  dismissModal() {
    this.dialog.dismiss();
  }

  closeModal(data) {
    this.dialog.close(data);
  }

  onSubmit() {
    this.dialog.close(this.comment)
  }
}
