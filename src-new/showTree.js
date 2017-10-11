// @flow
import {plus, nil, text, line, nest, layout, type Doc} from "./simpleFormat";
type Tree = {|+s: string, +ts: $ReadOnlyArray<Tree>|};
function showTree(tree: Tree): Doc {
  return plus(text(tree.s), nest(tree.s.length, showBracket(tree.ts)));
}

function showBracket(ts: $ReadOnlyArray<Tree>): Doc {
  if (ts.length === 0) {
    return nil();
  } else {
    return plus(text("["), plus(nest(1, showTrees(ts)), text("]")));
  }
}

function showTrees(ts: $ReadOnlyArray<Tree>): Doc {
  if (ts.length === 1) {
    return showTree(ts[0]);
  } else {
    return plus(
      showTree(ts[0]),
      plus(text(","), plus(line(), showTrees(ts.slice(1))))
    );
  }
}

const exampleTree: Tree = {
  s: "aaa",
  ts: [
    {
      s: "bbbb",
      ts: [{s: "ccc", ts: []}, {s: "dd", ts: []}],
    },
    {s: "eee", ts: []},
    {
      s: "ffff",
      ts: [{s: "gg", ts: []}, {s: "hhh", ts: []}, {s: "ii", ts: []}],
    },
  ],
};

console.log(layout(showTree(exampleTree)));
