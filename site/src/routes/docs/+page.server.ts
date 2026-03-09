import Md from "./SigmaSidekickDocs.md?raw";
import { compile } from "mdsvex";

export const load = async () => {
  return compile(Md);
};
