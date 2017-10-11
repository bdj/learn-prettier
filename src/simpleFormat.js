// @flow
export opaque type Doc = string;

function plus(x: Doc, y: Doc): Doc {
  return x + y;
}

function nil(): Doc {
  return "";
}

function text(s: string): Doc {
  return s;
}

function line(): Doc {
  return "\n";
}

function nest(i: number, doc: Doc): Doc {
  return doc.replace(/\n/g, "\n" + " ".repeat(i));
}

function layout(doc: Doc): string {
  return doc;
}

export {plus, nil, text, line, nest, layout};
