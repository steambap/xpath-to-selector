import { TokenType } from "./tokentype";

export interface ASTNode {
  type: string;
  start: number;
  end: number;
  value?: string;
  axis?: TokenType;
  nodeTest?: ASTNode;
  position?: string;
  predicate?: ASTNode[];
  arg?: ASTNode[];
  attr?: string;
  name?: string;
}
