import NoahwDesign from "./NoahwDesign.md?raw";
import {compile} from "mdsvex";

export const load = async () => {
    return compile(NoahwDesign);
}