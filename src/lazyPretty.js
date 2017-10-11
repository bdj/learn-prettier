// @flow
opaque type Nil = {|+type: "Nil"|};
opaque type Text = {|+type: "Text", +s: string, +x: Doc|};
opaque type Line = {|+type: "Line", +i: number, +x: Doc|};
opaque type Union = {|+type: "Union", +x: Doc, +y: Doc|};
opaque type Delay = {|+type: "Delay", +f: () => Doc|};
export opaque type Doc = Nil | Text | Line | Union | Delay;

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

function mkDelay(f: () => Doc) {
  return {type: "Delay", f};
}

function plus(x: Doc, y: Doc): Doc {
  switch (x.type) {
    case "Delay":
      return plus(x.f(), y);
    case "Text":
      return mkText(x.s, plus(x.x, y));
    case "Line":
      return mkLine(x.i, plus(x.x, y));
    case "Union":
      return mkUnion(plus(x.x, y), plus(x.y, y));
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
    case "Delay":
      return nest(i, x.f());
    case "Text":
      return mkText(x.s, nest(i, x.x));
    case "Line":
      return mkLine(i + x.i, nest(i, x.x));
    case "Union":
      return mkUnion(nest(i, x.x), nest(i, x.y));
    case "Nil":
      return mkNil();
    default:
      (x: empty);
      throw new Error("unknown type");
  }
}

function layout(x: Doc): string {
  switch (x.type) {
    case "Delay":
      return layout(x.f());
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

function flatten(x: Doc): Doc {
  switch (x.type) {
    case "Delay":
      return flatten(x.f());
    case "Text":
      return mkText(x.s, flatten(x.x));
    case "Line":
      return mkText(" ", flatten(x.x));
    case "Union":
      return flatten(x.x);
    case "Nil":
      return mkNil();
    default:
      (x: empty);
      throw new Error("unknown type");
  }
}

function group(x: Doc): Doc {
  switch (x.type) {
    case "Delay":
      return group(x.f());
    case "Text":
      return mkText(x.s, group(x.x));
    case "Line":
      return mkUnion(mkText(" ", flatten(x.x)), x);
    case "Union":
      return mkUnion(group(x.x), x.y);
    case "Nil":
      return mkNil();
    default:
      (x: empty);
      throw new Error("unknown type");
  }
}
let bestCalls = 0;

function best(w: number, k: number, x: Doc): Doc {
  bestCalls++;
  switch (x.type) {
    case "Delay":
      bestCalls--;
      return best(w, k, x.f());
    case "Text":
      const s = x.s;
      const xt = x.x;
      return mkText(s, mkDelay(() => best(w, k + s.length, xt)));
    case "Line":
      const i = x.i;
      const xl = x.x;
      return mkLine(i, mkDelay(() => best(w, i, xl)));
    case "Union":
      const xu = x.x;
      const y = x.y;
      return better(
        w,
        k,
        mkDelay(() => best(w, k, xu)),
        mkDelay(() => best(w, k, y))
      );
    case "Nil":
      return mkNil();
    default:
      (x: empty);
      throw new Error("unknown type");
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
    case "Delay":
      return fits(w, x.f());
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

function pretty(w: number, x: Doc): string {
  return layout(best(w, 0, x));
}

export {plus, nil, text, line, nest, group, pretty, bestCalls};
