import { BuilderContext } from "@angular-devkit/architect";
import { executeKarmaBuilder, KarmaBuilderOptions } from "@angular-devkit/build-angular";
import { NgxEnvSchema } from "../ngx-env/ngx-env-schema";
export declare const buildWithPlugin: (options: KarmaBuilderOptions & NgxEnvSchema, context: BuilderContext) => ReturnType<typeof executeKarmaBuilder>;
declare const _default: import("@angular-devkit/architect/src/internal").Builder<KarmaBuilderOptions & import("@angular-devkit/core").JsonObject>;
export default _default;
