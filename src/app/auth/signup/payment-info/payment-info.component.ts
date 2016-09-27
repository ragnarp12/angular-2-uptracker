import { Component, OnInit } from '@angular/core';

import { CreditCardModel } from '../../../models/index';
import { UserModel } from '../../../models/index';
import { UserService, CardService } from '../../../core/services/index';


@Component({
  selector: 'app-payment-info',
  templateUrl: './payment-info.component.html',
  styleUrls: ['./payment-info.component.scss']
})
export class PaymentInfoComponent implements OnInit {
  creditCard: CreditCardModel;
  trialCode: string;
  public masks = {
    card: [ /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
    expYear: [ /\d/, /\d/],
    cvc: [ /\d/, /\d/, /\d/],
  };
  public selectMonth = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  public selectYear = [];
  yearDirty: boolean = false;
  monthDirty: boolean = false;

  constructor() { }

  ngOnInit() {
    this.creditCard = new CreditCardModel;
    this.trialCode = '';
    let currentYear = new Date().getFullYear();
    for (let i = 0; i < 21; i++){
      this.selectYear.push(currentYear+i);
    }
  }

  changeYear(){
    this.yearDirty = true;
  }

  changeMonth(){
    this.monthDirty = true;
  }

}