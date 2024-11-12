export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'addSegment' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'getStory' : IDL.Func(
        [],
        [
          IDL.Record({
            'segments' : IDL.Vec(IDL.Text),
            'remainingTime' : IDL.Int,
            'isActive' : IDL.Bool,
          }),
        ],
        ['query'],
      ),
    'resetStory' : IDL.Func([], [], []),
    'startStory' : IDL.Func([IDL.Text], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
