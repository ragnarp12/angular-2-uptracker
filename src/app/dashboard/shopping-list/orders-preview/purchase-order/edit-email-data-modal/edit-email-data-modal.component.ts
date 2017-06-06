import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DialogRef, ModalComponent, CloseGuard } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DestroySubscribers } from 'ng2-destroy-subscribers';

export class EditEmailDataModalContext extends BSModalContext {
  public email_text: string;
  public po_number: string;
}

@Component({
  selector: 'edit-email-data-modal',
  templateUrl: './edit-email-data-modal.component.html',
  styleUrls: ['./edit-email-data-modal.component.scss']
})
@DestroySubscribers()
export class EditEmailDataModal implements OnInit, AfterViewInit, CloseGuard, ModalComponent<EditEmailDataModalContext> {
  public subscribers: any = {};
  context: EditEmailDataModalContext;

  public emailTo:string;
  public emailFrom:string;
  public emailSubject:string;
  public emailMessage:string;
  
  constructor(
      public dialog: DialogRef<EditEmailDataModalContext>,
  ) {
    this.context = dialog.context;
    dialog.setCloseGuard(this);
    this.emailMessage = this.context.email_text;
    this.emailSubject = "Purchase order #"+this.context.po_number;
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
  
  downloadPDF(){
  
  }
}