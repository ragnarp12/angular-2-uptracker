import { AllItemsListService } from './all-items-list.service';
import { BackorderedItemsListService } from './backordered-items-list.service';
import { FavoritedItemsListService } from './favorited-items-list.service';
import { FlaggedItemsListService } from './flagged-items-list.service';
import { OpenItemsListService } from './open-items-list.service';
import { ReceivedItemsListService } from './received-items-list.service';
import { ClosedItemsListService } from './closed-items-list.service';

export const ORDER_PROVIDERS = [
  AllItemsListService,
  BackorderedItemsListService,
  ClosedItemsListService,
  FavoritedItemsListService,
  FlaggedItemsListService,
  OpenItemsListService,
  ReceivedItemsListService,
];
