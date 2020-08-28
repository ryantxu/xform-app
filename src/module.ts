import { ComponentClass } from "react";

import { ExampleConfigCtrl } from "./legacy/config";
import {
  AppPlugin,
  AppRootProps,
  standardTransformersRegistry
} from "@grafana/data";
import { ExampleRootPage } from "./ExampleRootPage";
import { ScreensAppSettings } from "./types";
import { prefixJoinTransformRegistryItem } from "./transformers/PrefixJoinTransformerEditor";

// Legacy exports just for testing
export { ExampleConfigCtrl as ConfigCtrl };

export const plugin = new AppPlugin<ScreensAppSettings>().setRootPage(
  (ExampleRootPage as unknown) as ComponentClass<AppRootProps>
);

standardTransformersRegistry.register(prefixJoinTransformRegistryItem);

console.log("registered custom transformer");
