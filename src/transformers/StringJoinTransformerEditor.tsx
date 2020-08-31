import React from 'react';
import {
  TransformerRegistyItem,
  TransformerUIProps,
  SelectableValue,
  DataFrame,
  getFrameDisplayName,
  FieldType,
  getFieldDisplayName,
} from '@grafana/data';
import { Select, HorizontalGroup, VerticalGroup, Switch, Label } from '@grafana/ui';

import {
  StringJoinOptions,
  stringJoinTransformer,
  FieldNormOptions,
  getDefautlOptions,
  JoinWhen,
  JoinSide,
} from './stringJoin';

interface StringJoinTransformerEditorProps extends TransformerUIProps<StringJoinOptions> {}

// frameIndex: number;
// fieldName: string;
// regexp: string;
interface SideEditorProps {
  name: string;
  side: FieldNormOptions;
  data: DataFrame[];
  onChange: (side: FieldNormOptions) => void;
}

class SideEditor extends React.PureComponent<SideEditorProps> {
  onIndexChange = (v: SelectableValue<number>) => {
    this.props.onChange({
      ...this.props.side,
      frameIndex: v.value!,
    });
  };

  onNameChange = (v: SelectableValue<string>) => {
    this.props.onChange({
      ...this.props.side,
      fieldName: v.value!,
    });
  };

  render() {
    const { name, side, data } = this.props;
    const frames: Array<SelectableValue<number>> = [];
    const names: Array<SelectableValue<string>> = [];
    let frame: DataFrame | undefined;
    if (data) {
      for (let i = 0; i < data.length; i++) {
        frames.push({ value: i, label: `${i}) ${getFrameDisplayName(data[i], i)}` });
        if (i === side.frameIndex) {
          frame = data[i];
        }
      }
    }

    if (frame) {
      for (const f of frame.fields) {
        if (f.type === FieldType.string) {
          const n = getFieldDisplayName(f, frame, data);
          names.push({ label: n, value: n });
        }
      }
    }

    return (
      <div>
        <h3>{name}</h3>
        Frame Index:
        <Select value={frames.find(v => v.value === side.frameIndex)} options={frames} onChange={this.onIndexChange} />
        <br />
        Field Name:
        <Select value={names.find(v => v.value === side.fieldName)} options={names} onChange={this.onNameChange} />
        <br />
        Regexp: {side.regexp}
        <br />
      </div>
    );
  }
}

// export enum JoinSide {
//   LeftRight = 'LeftRight',
//   RightLeft = 'RightLeft',
// }

// export enum JoinWhen {
//   Equals = 'equals',
//   StartsWith = 'startsWith',
//   EndsWith = 'endsWith',
//   Contains = 'contains',
// }

const joinWhenOptions: Array<SelectableValue<JoinWhen>> = [
  { label: 'Equals', value: JoinWhen.Equals },
  { label: 'Starts With', value: JoinWhen.StartsWith },
  { label: 'Ends With', value: JoinWhen.EndsWith },
  { label: 'Contains', value: JoinWhen.Contains },
];

const joinSideLeft: Array<SelectableValue<JoinSide>> = [
  { label: 'Left', value: JoinSide.LeftRight },
  { label: 'Right', value: JoinSide.RightLeft },
];

const joinSideRight: Array<SelectableValue<JoinSide>> = [
  { label: 'Left', value: JoinSide.RightLeft },
  { label: 'Right', value: JoinSide.LeftRight },
];

export class StringJoinTransformerEditor extends React.PureComponent<StringJoinTransformerEditorProps> {
  constructor(props: StringJoinTransformerEditorProps) {
    super(props);
  }

  onLeftChange = (left: FieldNormOptions) => {
    this.props.onChange({
      ...this.props.options,
      left,
    });
  };

  onRightChange = (right: FieldNormOptions) => {
    this.props.onChange({
      ...this.props.options,
      right,
    });
  };

  onSideChange = (val: SelectableValue<JoinSide>) => {
    this.props.onChange({
      ...this.props.options,
      side: val.value!,
    });
  };

  onWhenChange = (val: SelectableValue<JoinWhen>) => {
    this.props.onChange({
      ...this.props.options,
      when: val.value!,
    });
  };

  onToggleIgnoreCase = () => {
    const { options } = this.props;
    this.props.onChange({
      ...options,
      ignoreCase: !options.ignoreCase,
    });
  };

  onToggleDebug = () => {
    const { options } = this.props;
    this.props.onChange({
      ...options,
      debug: !options.debug,
    });
  };

  render() {
    const { input } = this.props;
    const options = {
      ...getDefautlOptions(this.props.input),
      ...this.props.options,
    };

    return (
      <table width="100%">
        <tbody>
          <tr>
            <td width="50%">
              <SideEditor data={input} side={options.left || {}} name="Left" onChange={this.onLeftChange} />
            </td>
            <td width="50%">
              <SideEditor data={input} side={options.right || {}} name="Right" onChange={this.onRightChange} />
            </td>
          </tr>
          <tr>
            <td colSpan={2}>
              <br />
              <h3>When</h3>

              <VerticalGroup>
                <HorizontalGroup>
                  <Select
                    value={joinSideLeft.find(v => v.value === options.side)}
                    options={joinSideLeft}
                    onChange={this.onSideChange}
                  />
                  <Select
                    value={joinWhenOptions.find(v => v.value === options.when)}
                    options={joinWhenOptions}
                    onChange={this.onWhenChange}
                  />
                  <Select
                    value={joinSideRight.find(v => v.value === options.side)}
                    options={joinSideRight}
                    onChange={this.onSideChange}
                  />
                </HorizontalGroup>

                <HorizontalGroup>
                  <Switch css="" value={options.ignoreCase || false} onChange={this.onToggleIgnoreCase} />
                  <Label>Ignore Case</Label>
                </HorizontalGroup>
                <HorizontalGroup>
                  <Switch css="" value={options.debug || false} label="Debug Output" onChange={this.onToggleDebug} />
                  <Label>Debug Output</Label>
                </HorizontalGroup>
              </VerticalGroup>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}

export const stringJoinTransformRegistryItem: TransformerRegistyItem<StringJoinOptions> = {
  id: stringJoinTransformer.id,
  editor: StringJoinTransformerEditor,
  transformation: stringJoinTransformer,
  name: stringJoinTransformer.name,
  description: stringJoinTransformer.description,
};
