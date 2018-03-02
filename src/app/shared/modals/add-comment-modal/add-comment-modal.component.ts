import { Component, OnInit } from '@angular/core';

import { DialogRef, ModalComponent } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';

export class AddCommentModalContext extends BSModalContext {
  public item: any;
}


@Component({
  selector: 'app-add-comment-modal',
  templateUrl: './add-comment-modal.component.html',
  styleUrls: ['./add-comment-modal.component.scss']
})
export class AddCommentModalComponent implements OnInit, ModalComponent<AddCommentModalContext> {
  context;
  public comment: any;

  constructor(
    public dialog: DialogRef<AddCommentModalContext>,
  ) {
    this.context = dialog.context;
    this.comment = {};
  }
  
  ngOnInit() {}

  dismissModal() {
    this.dialog.dismiss();
  }

  onSubmit() {
    this.dialog.close(this.comment);
  }
}
