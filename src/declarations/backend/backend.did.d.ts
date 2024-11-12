import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'addSegment' : ActorMethod<[string], boolean>,
  'getStory' : ActorMethod<
    [],
    {
      'segments' : Array<string>,
      'remainingTime' : bigint,
      'isActive' : boolean,
    }
  >,
  'resetStory' : ActorMethod<[], undefined>,
  'startStory' : ActorMethod<[string], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
