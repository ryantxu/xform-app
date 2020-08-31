import {
  DataFrame,
  DataTransformerInfo,
  toDataFrame,
  FieldType,
  getFieldDisplayName,
  ArrayVector,
  Field,
} from '@grafana/data';

import escapeRegExp from 'lodash/escapeRegExp';

export enum JoinSide {
  LeftRight = 'LeftRight',
  RightLeft = 'RightLeft',
}

export enum JoinWhen {
  Equals = 'equals',
  StartsWith = 'startsWith',
  EndsWith = 'endsWith',
  Contains = 'contains',
}

export interface FieldNormOptions {
  frameIndex: number;
  fieldName: string;
  regexp: string;
}

export interface StringJoinOptions {
  left: FieldNormOptions;
  right: FieldNormOptions;
  side: JoinSide;
  when: JoinWhen;
  ignoreCase?: boolean;
  joinAllMatches?: boolean;
  debug?: boolean;
}

export const stringJoinTransformer: DataTransformerInfo<StringJoinOptions> = {
  id: 'custom-string-join',
  name: 'String join (custon)',
  description: 'todo... join by string',

  transformer: options => (data: DataFrame[]) => {
    const config = {
      ...getDefautlOptions(data),
      ...options,
    };

    const leftFrame = data[config.left?.frameIndex];
    const rightFrame = data[config.right?.frameIndex];
    if (!leftFrame || !rightFrame) {
      //      throw new Error('missing left/right frames');
      console.log('ERROR missing left/right frames');
      return data;
    }

    // Create left/right normalized fields
    const leftField = getNormalizedField(leftFrame, config.left, 'Left norm');
    const rightField = getNormalizedField(rightFrame, config.right, 'Right norm');
    if (!leftField || !rightField) {
      //      throw new Error('missing left/right fields');
      console.log('ERROR missing left/right fields');
      return data;
    }

    let keyNormalize = (v: any): string => v;
    if (config.ignoreCase && config.when === JoinWhen.Equals) {
      keyNormalize = (v: string) => {
        return `${v}`.toLowerCase();
      };
    }

    // 1. Find the unique left values
    let norm = leftField.norm.values;
    const leftToRight: Map<string, number[]> = new Map<string, number[]>();
    for (let i = 0; i < norm.length; i++) {
      const v = keyNormalize(norm.get(i));
      leftToRight.set(v, []);
    }

    // 2. Match right values
    norm = rightField.norm.values;
    if (config.when === JoinWhen.Equals) {
      for (let i = 0; i < norm.length; i++) {
        const key = keyNormalize(norm.get(i));
        const ids = leftToRight.get(key);
        if (ids) {
          ids.push(i);
        }
      }
    } else {
      // Requires scanning! -- contains needs an an oposite regex check
      let theSide = config.side;
      if (config.when === JoinWhen.Contains) {
        theSide = theSide === JoinSide.LeftRight ? JoinSide.RightLeft : JoinSide.LeftRight;
      }
      if (theSide === JoinSide.LeftRight) {
        for (const leftKey of leftToRight.keys()) {
          const regexp = getRegexpTestFor(leftKey, config);
          for (let i = 0; i < norm.length; i++) {
            const val = norm.get(i) as string;
            if (val) {
              if (regexp.test(val)) {
                leftToRight.get(leftKey)?.push(i);
                if (!config.joinAllMatches) {
                  break; // stop scanning when you find something
                }
              }
            }
          }
        }
      } else if (theSide === JoinSide.RightLeft) {
        for (let i = 0; i < norm.length; i++) {
          const rightVal = norm.get(i) as string;
          if (rightVal) {
            const regexp = getRegexpTestFor(rightVal, config);
            for (const leftKey of leftToRight.keys()) {
              console.log('TEST', regexp, leftKey);
              if (regexp.test(leftKey)) {
                leftToRight.get(leftKey)?.push(i);
                if (!config.joinAllMatches) {
                  break; // stop scanning when you find something
                }
              }
            }
          }
        }
      }
    }

    // Return debug information
    if (config.debug) {
      const matches = leftField.norm.values.toArray().map(v => {
        return leftToRight.get(keyNormalize(v));
      });

      return [
        toDataFrame({
          name: 'Left',
          fields: [leftField.field, leftField.norm, { name: 'Matches', type: FieldType.other, values: matches }],
        }),
        toDataFrame({
          name: 'Right',
          fields: [rightField.field, rightField.norm],
        }),
      ];
    }

    // Make a copy for each
    const rightValues: any[][] = new Array(rightFrame.fields.length);
    const rightFields = rightFrame.fields.map((f, idx) => {
      const buffer = new Array(leftFrame.length);
      rightValues[idx] = buffer;
      return {
        ...f,
        values: new ArrayVector(buffer),
        state: undefined, // remove state
      };
    });
    norm = leftField.norm.values;
    for (let i = 0; i < norm.length; i++) {
      const key = keyNormalize(norm.get(i));
      const found = leftToRight.get(key);
      if (found && found.length) {
        const row = found[0];
        for (let j = 0; j < rightValues.length; j++) {
          const v = rightFrame.fields[j].values.get(row);
          rightValues[j][i] = v;
        }
      }
    }
    return [
      {
        ...leftFrame,
        fields: [...leftFrame.fields, ...rightFields],
      },
    ]; // single frame
  },
};

function getRegexpTestFor(val: string, config: StringJoinOptions): RegExp {
  val = escapeRegExp(val);

  const flag = config.ignoreCase ? 'i' : '';
  switch (config.when) {
    case JoinWhen.StartsWith:
      return new RegExp(`^${val}`, flag);
    case JoinWhen.EndsWith:
      return new RegExp(`${val}$`, flag);
    case JoinWhen.Contains:
      return new RegExp(val, flag);
  }

  return new RegExp(val, flag); // sam e as contains
}

function getNormalizedField(frame: DataFrame, opts: FieldNormOptions, name: string) {
  const field = frame.fields.find(f => opts.fieldName === getFieldDisplayName(f, frame));
  if (!field) {
    return undefined;
  }

  const norm: Field<string> = {
    ...field,
    name,
    config: {}, // Remove the name from the datasource
    state: undefined, // remove state
  };
  if (opts.regexp) {
    const source = field.values;
    const normalizedValues = new Array(source.length);
    const regexp = new RegExp(opts.regexp); // 'gi' flags?
    for (let i = 0; i < source.length; i++) {
      const v = source.get(i);
      if (v) {
        const m = regexp.exec(v);
        if (m) {
          normalizedValues[i] = m[0]; // the whole string
        }
      }
    }
    norm.values = new ArrayVector(normalizedValues);
  }
  return { field, norm };
}

function getDefaultNormalizer(frames: DataFrame[], frameIndex: number): FieldNormOptions | undefined {
  const frame = frames[frameIndex];
  if (!frame) {
    return undefined;
  }
  // Find the first string field
  const field = frame.fields.find(f => f.type === FieldType.string);
  if (!field) {
    return undefined;
  }

  return {
    frameIndex,
    fieldName: getFieldDisplayName(field, frame, frames),
    regexp: `^\\S*`, // first characters
  };
}

export function getDefautlOptions(data: DataFrame[]): StringJoinOptions {
  return {
    left: getDefaultNormalizer(data, 0)!,
    right: getDefaultNormalizer(data, 1)!,
    side: JoinSide.LeftRight,
    when: JoinWhen.Equals,
    ignoreCase: true,
  };
}
