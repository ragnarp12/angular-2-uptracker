import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Angular2FontawesomeModule } from 'angular2-fontawesome';

import { SearchFilterHeaderComponent } from './search-filter-header.component';
import { ChipsInputModule } from '../chips-input/chips-input.module';

@NgModule({
  declarations: [
    SearchFilterHeaderComponent,
  ],
  exports: [SearchFilterHeaderComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Angular2FontawesomeModule,
    ChipsInputModule,
  ],
  providers: [],
})
export class SearchFilterHeaderModule {

}
