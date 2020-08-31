import { ExampleConfigCtrl } from './legacy/config';
import { AppPlugin, standardTransformersRegistry } from '@grafana/data';
import { XFormAppSettings } from './types';
import { stringJoinTransformRegistryItem } from './transformers/StringJoinTransformerEditor';

export { ExampleConfigCtrl as ConfigCtrl };

export const plugin = new AppPlugin<XFormAppSettings>();

standardTransformersRegistry.register(stringJoinTransformRegistryItem);

console.log('registered custom transformer');
