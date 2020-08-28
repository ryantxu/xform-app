import React from "react";
import { TransformerRegistyItem, TransformerUIProps } from "@grafana/data";

import { PrefixJoinOptions, prefixJoinTransformer } from "./prefixJoin";

interface PrefixJoinTransformerEditorProps
  extends TransformerUIProps<PrefixJoinOptions> {}

export class PrefixJoinTransformerEditor extends React.PureComponent<
  PrefixJoinTransformerEditorProps
> {
  constructor(props: PrefixJoinTransformerEditorProps) {
    super(props);
  }

  render() {
    return (
      <div className="gf-form-inline">
        <div className="gf-form gf-form--grow">
          TODO... add the real UI here
        </div>
      </div>
    );
  }
}

export const prefixJoinTransformRegistryItem: TransformerRegistyItem<PrefixJoinOptions> = {
  id: prefixJoinTransformer.id,
  editor: PrefixJoinTransformerEditor,
  transformation: prefixJoinTransformer,
  name: prefixJoinTransformer.name,
  description: prefixJoinTransformer.description
};
