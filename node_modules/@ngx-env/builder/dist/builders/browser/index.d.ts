import { BuilderContext } from "@angular-devkit/architect";
import { BrowserBuilderOptions, executeBrowserBuilder } from "@angular-devkit/build-angular";
import { NgxEnvSchema } from "../ngx-env/ngx-env-schema";
export declare const buildWithPlugin: (options: BrowserBuilderOptions & NgxEnvSchema, context: BuilderContext) => ReturnType<typeof executeBrowserBuilder>;
declare const _default: import("@angular-devkit/architect/src/internal").Builder<BrowserBuilderOptions & import("@angular-devkit/core").JsonObject>;
export default _default;
