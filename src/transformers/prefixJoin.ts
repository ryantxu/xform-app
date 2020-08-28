import { DataFrame, DataTransformerInfo, toDataFrame } from "@grafana/data";

export interface PrefixJoinOptions {
  left?: string;
  right?: string;
}

export const prefixJoinTransformer: DataTransformerInfo<PrefixJoinOptions> = {
  id: "custom-prefix-join",
  name: "Prefix Join (custon)",
  description: "todo... join with prefix",
  defaultOptions: {
    left: "hello"
  },
  transformer: options => (data: DataFrame[]) => {
    const frame = toDataFrame({
      name: "test",
      fields: [
        { name: "A", values: [1, 2, 3] },
        { name: "B", values: ["a", "b", "c"] }
      ]
    });

    return [frame];
  }
};
