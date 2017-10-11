// @flow
opaque type Nil = {|+type: "Nil"|};
opaque type Text = {|+type: "Text", +s: string, +x: Doc|};
opaque type Line = {|+type: "Line", +i: number, +x: Doc|};
opaque type Union = {|+type: "Union", +x: Doc, +y: Doc|};
opaque type Doc = Nil | Text | Line | Union;

opaque type NIL = {|+type: "NIL"|};
opaque type PLUS = {|+type: "PLUS", +x: DOC, +y: DOC|};
opaque type NEST = {|+type: "NEST", +i: number, +x: DOC|};
opaque type TEXT = {|+type: "TEXT", +s: string|};
opaque type LINE = {|+type: "LINE"|};
opaque type SOFTLINE = {|+type: "SOFTLINE"|};
opaque type UNION = {|+type: "UNION", +x: DOC, +y: DOC|};
export opaque type DOC = NIL | PLUS | NEST | TEXT | LINE | SOFTLINE | UNION;

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

function mkUnion(x: Doc, y: Doc) {
  return {type: "Union", x, y};
}

const NILL = {type: "NIL"};
function mkNIL() {
  return NILL;
}

function mkPLUS(x: DOC, y: DOC) {
  return {type: "PLUS", x, y};
}

function mkNEST(i: number, x: DOC) {
  return {type: "NEST", i, x};
}

function mkTEXT(s: string) {
  return {type: "TEXT", s};
}

function mkLINE() {
  return {type: "LINE"};
}

function mkSOFTLINE() {
  return {type: "SOFTLINE"};
}

function mkUNION(x: DOC, y: DOC): DOC {
  return {type: "UNION", x, y};
}

function plus(x: DOC, y: DOC): DOC {
  return mkPLUS(x, y);
}

function nil(): DOC {
  return mkNIL();
}

function text(s: string): DOC {
  return mkTEXT(s);
}

function line(): DOC {
  return mkLINE();
}

function softline(): DOC {
  return mkSOFTLINE();
}

function nest(i: number, x: DOC): DOC {
  return mkNEST(i, x);
}

function layout(x: Doc): string {
  switch (x.type) {
    case "Text":
      return x.s + layout(x.x);
    case "Line":
      return "\n" + " ".repeat(x.i) + layout(x.x);
    case "Union":
      throw new Error("union in layout");
    case "Nil":
      return "";
    default:
      (x: empty);
      throw new Error("unknown type");
  }
}

function flatten(x: DOC): DOC {
  switch (x.type) {
    case "NIL":
      return mkNIL();
    case "PLUS":
      return mkPLUS(flatten(x.x), flatten(x.y));
    case "NEST":
      return flatten(x.x);
    case "TEXT":
      return x;
    case "LINE":
      return mkTEXT(" ");
    case "SOFTLINE":
      return mkNIL();
    case "UNION":
      return flatten(x.x);
    default:
      (x: empty);
      throw new Error("unknown type");
  }
}

function group(x: DOC): DOC {
  return mkUNION(flatten(x), x);
}

function best(w: number, k: number, x: DOC): Doc {
  return be(w, k, [[0, x]]);
}

function be(w: number, k: number, idocs: $ReadOnlyArray<[number, DOC]>): Doc {
  if (idocs.length === 0) {
    return mkNil();
  } else {
    const i = idocs[0][0];
    const x = idocs[0][1];
    const z = idocs.slice(1);
    switch (x.type) {
      case "NIL":
        return be(w, k, z);
      case "PLUS":
        return be(w, k, [[i, x.x], [i, x.y]].concat(z));
      case "NEST":
        return be(w, k, [[i + x.i, x.x]].concat(z));
      case "TEXT":
        return mkText(x.s, be(w, k + x.s.length, z));
      case "LINE":
        return mkLine(i, be(w, i, z));
      case "SOFTLINE":
        return mkLine(i, be(w, i, z));
      case "UNION":
        return better(
          w,
          k,
          be(w, k, [[i, x.x]].concat(z)),
          be(w, k, [[i, x.y]].concat(z))
        );
      default:
        (x: empty);
        throw new Error("unknown type");
    }
  }
}

function better(w: number, k: number, x: Doc, y: Doc): Doc {
  return fits(w - k, x) ? x : y;
}

function fits(w: number, x: Doc): boolean {
  if (w < 0) {
    return false;
  }
  switch (x.type) {
    case "Text":
      return fits(w - x.s.length, x.x);
    case "Line":
      return true;
    case "Union":
      throw new Error("union in fits");
    case "Nil":
      return true;
    default:
      (x: empty);
      throw new Error("unknown type");
  }
}

function pretty(w: number, x: DOC): string {
  return layout(best(w, 0, x));
}

export {plus, nil, text, line, nest, group, pretty, flatten, softline, mkUNION};
