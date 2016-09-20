import { Injectable } from '@angular/core';
import { RequestMethod } from '@angular/http';
import { Resource, ResourceParams, ResourceAction, ResourceMethod } from 'ng2-resource-rest';

interface IQueryInput {
  page?: number;
  perPage?: number;
  dateFrom?: string;
  dateTo?: string;
  isRead?: string;
}

interface INewsShort {
  id: number;
  date: string;
  title: string;
  text: string;
}

interface INews extends INewsShort {
  image?: string;
  fullText: string;
}

@Injectable()
@ResourceParams({
  url: 'http://private-anon-ce8323ff87-uptracker.apiary-mock.com/api/v1'
})
export class coreResource extends Resource {

  @ResourceAction({
    isArray: true
  })
  query: ResourceMethod<IQueryInput, INewsShort[]>;

  @ResourceAction({
    path: '/{!id}'
  })
  get: ResourceMethod<{id: any}, INews>;

  @ResourceAction({
    method: RequestMethod.Post
  })
  save: ResourceMethod<INews, INews>;

  @ResourceAction({
    method: RequestMethod.Put,
    path: '/{!id}'
  })
  update: ResourceMethod<INews, INews>;

  @ResourceAction({
    method: RequestMethod.Delete,
    path: '/{!id}'
  })
  remove: ResourceMethod<{id: any}, any>;

  // Alias to save
  create(data: INews, callback?: (res: INews) => any): INews {
    return this.save(data, callback);
  }

}
