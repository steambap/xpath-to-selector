import tt, { TokenType } from "./tokentype";
import { ASTNode } from "./definition";

function axisToStr(axis: TokenType, isFirst: boolean) {
  if (isFirst) {
    return "";
  }

  if (axis === tt.doubleSlash) {
    // child or descendent
    return " ";
  } else if (axis === tt.slash) {
    return " > ";
  }

  throw Error("!Unexpected axis");
}

function nodeTestToStr(node: ASTNode): string {
  if (node.value === "*") {
    return "";
  }

  return node.value || "";
}

function attrFilterToStr(node: ASTNode) {
  const attr = node.attr;

  if (attr === "id") {
    return "#" + node.value;
  } else if (attr === "class") {
    return "." + node.value;
  } else {
    return "[" + attr + '="' + node.value + '"]';
  }
}

function containsToStr(node: ASTNode) {
  if (node.name !== "contains" || !node.arg) {
    throw new Error("Unsupported function: " + node.name);
  }

  if (node.arg.length !== 2) {
    throw new Error("Expect contains function to have 2 arguments");
  }

  if (node.arg[0].name !== "text") {
    throw new Error("Only text function is supported inside contains");
  }

  return ":contains(" + node.arg[1].name + ")";
}

function predicateToStr(node: ASTNode) {
  switch (node.type) {
    case "positionFilter":
      return ":nth-child(" + node.position + ")";
    case "attributeFilter":
      return attrFilterToStr(node);
    case "function":
      return containsToStr(node);
    case "name":
      return ":has(" + node.name + ")";

    default:
      throw new Error("!Unhandled predicate");
  }
}

function stepToSel(step: ASTNode, index: number) {
  const axis = axisToStr(step.axis as TokenType, index === 0);
  const nodeTest = nodeTestToStr(step.nodeTest as ASTNode);
  const predicate = (step.predicate || []).map(predicateToStr);

  return axis + nodeTest + predicate.join("");
}

export default function xpath2css(steps: ASTNode[]): string {
  const selectorList = steps.map(stepToSel);

  return selectorList.join("");
}
