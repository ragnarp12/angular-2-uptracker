import { Component } from '@angular/core';

import { DialogRef, ModalComponent, CloseGuard } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';

export class LocationModalContext extends BSModalContext {
  // public num1: number;
  // public num2: number;
}

/**
 * A Sample of how simple it is to create a new window, with its own injects.
 */
@Component({
  selector: 'app-location-modal',
  //TODO: [ngClass] here on purpose, no real use, just to show how to workaround ng2 issue #4330.
  // Remove when solved.
  /* tslint:disable */
  templateUrl: './location-modal.component.html',
  styleUrls: ['./location-modal.component.scss']
})
export class LocationModal implements CloseGuard, ModalComponent<LocationModalContext> {
  context: LocationModalContext;
  location = {};
  selectedType = '';
  selectedState = '';
  typeDirty: boolean = false;
  stateDirty: boolean = false;

  constructor(public dialog: DialogRef<LocationModalContext>) {
    this.context = dialog.context;
    dialog.setCloseGuard(this);
  }

  closeModal(){
    this.dialog.close();
  }

  // beforeDismiss(): boolean {
  //   return true;
  // }
  //
  // beforeClose(): boolean {
  //   return true;
  // }

  changeState(){
    this.stateDirty = true;
  }

  changeType(){
    this.typeDirty = true;
  }
}