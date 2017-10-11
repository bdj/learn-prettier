// @flow
opaque type Nil = {|+type: "Nil"|};
opaque type Text = {|+type: "Text", +s: string, +x: Doc|};
opaque type Line = {|+type: "Line", +i: number, +x: Doc|};
export opaque type Doc = Nil | Text | Line;

const nill = {type: "Nil"};
function mkNil(): Nil {
  return nill;
}

function mkText(s: string, x: Doc) {
  return {type: "Text", s, x};
}

function mkLine(i: number, x: Doc) {
  return {type: "Line", i, x};
}

function plus(x: Doc, y: Doc): Doc {
  switch (x.type) {
    case "Text":
      return mkText(x.s, plus(x.x, y));
    case "Line":
      return mkLine(x.i, plus(x.x, y));
    case "Nil":
      return y;
    default:
      (x: empty);
      throw new Error("unknown type");
  }
}

function nil(): Doc {
  return mkNil();
}

function text(s: string): Doc {
  return mkText(s, mkNil());
}

function line(): Doc {
  return mkLine(0, mkNil());
}

function nest(i: number, x: Doc): Doc {
  switch (x.type) {
    case "Text":
      return mkText(x.s, nest(i, x.x));
    case "Line":
      return mkLine(i + x.i, nest(i, x.x));
    case "Nil":
      return mkNil();
    default:
      (x: empty);
      throw new Error("unknown type");
  }
}

function layout(x: Doc): string {
  switch (x.type) {
    case "Text":
      return x.s + layout(x.x);
    case "Line":
      return "\n" + " ".repeat(x.i) + layout(x.x);
    case "Nil":
      return "";
    default:
      (x: empty);
      throw new Error("unknown type");
  }
}

export {plus, nil, text, line, nest, layout};
