// @flow
import {
  nil,
  nest,
  plus,
  text,
  line,
  group,
  flatten,
  softline,
  mkUNION,
  type DOC,
} from "./efficientPretty";

function joinWithSpace(x: DOC, y: DOC): DOC {
  return plus(x, plus(text(" "), y));
}

function joinWithLine(x: DOC, y: DOC): DOC {
  return plus(x, plus(line(), y));
}

function folddoc<T>(f: (DOC, DOC) => DOC, docs: $ReadOnlyArray<DOC>): DOC {
  if (docs.length === 0) {
    return nil();
  } else if (docs.length === 1) {
    return docs[0];
  } else {
    return f(docs[0], folddoc(f, docs.slice(1)));
  }
}

function spread(docs: $ReadOnlyArray<DOC>): DOC {
  return folddoc(joinWithSpace, docs);
}

function stack(docs: $ReadOnlyArray<DOC>): DOC {
  return folddoc(joinWithLine, docs);
}

function bracket(l: string, x: DOC, r: string): DOC {
  return group(
    plus(text(l), plus(nest(2, plus(softline(), x)), plus(softline(), text(r))))
  );
}

function joinWithLineOrSpace(x: DOC, y: DOC): DOC {
  return plus(x, plus(group(line()), y));
}

function fillwords(s: string): DOC {
  return folddoc(joinWithLineOrSpace, s.split(/\s+/).map(text));
}

function fill(docs: $ReadOnlyArray<DOC>): DOC {
  if (docs.length === 0) {
    return nil();
  } else if (docs.length === 1) {
    return docs[0];
  } else {
    const x = docs[0];
    const y = docs[1];
    const zs = docs.slice(2);
    return mkUNION(
      joinWithSpace(flatten(x), fill([flatten(y)].concat(zs))),
      joinWithLine(x, fill([y].concat(zs)))
    );
  }
}

export {
  joinWithSpace,
  joinWithLine,
  folddoc,
  spread,
  stack,
  bracket,
  joinWithLineOrSpace,
  fillwords,
  fill,
};
