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
    return `#${node.value}`;
  } else if (attr === "class") {
    return `.${node.value}`;
  } else {
    return `[${attr}="${node.value}"]`;
  }
}

function xpathFuncToStr(node: ASTNode) {
  switch (node.name) {
    case "contains":
      return containsToStr(node);
    case "position":
      return positionToStr(node);
    default:
      throw new Error(`Unsupported function: ${node.name}`);
  }
}

function positionToStr(node: ASTNode) {
  return `:nth-child(${node.position})`;
}

function containsToStr(node: ASTNode) {
  if (!node.arg) {
    throw new Error(`No arguments for function: ${node.name}`);
  }

  if (node.arg.length !== 2) {
    throw new Error("Expect contains function to have 2 arguments");
  }

  if (node.arg[0].name === "text") {
    return `:contains(${node.arg[1].name})`;
  }

  if (node.arg[0].type === "attribute") {
    return `[${node.arg[0].attr}*=${node.arg[1].name}]`;
  }

  throw new Error(`Unsupported function: ${node.arg[0].type}`);
}

function predicateToStr(node: ASTNode) {
  switch (node.type) {
    case "positionFilter":
      return `:nth-child(${node.position})`;
    case "attributeFilter":
      return attrFilterToStr(node);
    case "function":
      return xpathFuncToStr(node);
    case "name":
      return `:has(${node.name})`;

    default:
      throw new Error("!Unhandled predicate");
  }
}

function stepToSel(step: ASTNode, index: number) {
  const axis = axisToStr(step.axis!, index === 0);
  const nodeTest = nodeTestToStr(step.nodeTest!);
  const predicate = (step.predicate || []).map(predicateToStr);

  return axis + nodeTest + predicate.join("");
}

export default function xpath2css(steps: ASTNode[]): string {
  const selectorList = steps.map(stepToSel);

  return selectorList.join("");
}
