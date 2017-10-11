// @flow
import {
  nil,
  plus,
  text,
  pretty,
  group,
  line,
  type DOC,
} from "./efficientPretty";
import {folddoc, bracket, fill} from "./utils";

opaque type Elt = {|
  +type: "Elt",
  +name: string,
  +attributes: $ReadOnlyArray<Att>,
  +children: $ReadOnlyArray<XML>,
|};
opaque type Txt = {|+type: "Txt", +s: string|};
opaque type XML = Elt | Txt;
opaque type Att = {|+type: "Att", +name: string, +value: string|};

function mkElt(
  name: string,
  attributes: $ReadOnlyArray<Att>,
  children: $ReadOnlyArray<XML>
): XML {
  return {type: "Elt", name, attributes, children};
}

function mkTxt(s: string): XML {
  return {type: "Txt", s};
}

function mkAtt(name: string, value: string): Att {
  return {type: "Att", name, value};
}

function showXML(x: XML): DOC {
  return folddoc(plus, showXMLs(x));
}

function showXMLs(x: XML): $ReadOnlyArray<DOC> {
  switch (x.type) {
    case "Elt":
      if (x.children.length === 0) {
        return [
          plus(text("<"), plus(showTag(x.name, x.attributes), text("/>"))),
        ];
      } else {
        return [
          plus(
            text("<"),
            plus(
              showTag(x.name, x.attributes),
              plus(
                text(">"),
                plus(
                  showFill(showXMLs, x.children),
                  plus(text("</"), plus(text(x.name), text(">")))
                )
              )
            )
          ),
        ];
      }
    case "Txt":
      return x.s.split(/\s+/).map(text);
    default:
      (x: empty);
      throw new Error("unknown type");
  }
}

function showAtts(attribute: Att): $ReadOnlyArray<DOC> {
  return [
    plus(text(attribute.name), plus(text("="), text(quoted(attribute.value)))),
  ];
}

function quoted(s: string): string {
  return `"${s}"`;
}

function showTag(name: string, attributes: $ReadOnlyArray<Att>): DOC {
  if (attributes.length === 0) {
    return text(name);
  } else {
    return plus(text(name), plus(text(" "), showFill(showAtts, attributes)));
  }
}

function showFill<T>(f: T => $ReadOnlyArray<DOC>, xs: $ReadOnlyArray<T>): DOC {
  if (xs.length === 0) {
    return nil();
  } else {
    return bracket(
      "",
      fill(
        xs.reduceRight(function(ans, x) {
          return f(x).concat(ans);
        }, [])
      ),
      ""
    );
  }
}

const exampleXML = mkElt(
  "p",
  [mkAtt("color", "red"), mkAtt("font", "Times"), mkAtt("size", "10")],
  [
    mkTxt("Here is some"),
    mkElt("em", [], [mkTxt("emphasized")]),
    mkTxt("text."),
    mkTxt("Here is a"),
    mkElt("a", [mkAtt("href", "http://www.eg.com/")], [mkTxt("link")]),
    mkTxt("elsewhere."),
  ]
);

console.log(pretty(parseInt(process.argv[2]), showXML(exampleXML)));
