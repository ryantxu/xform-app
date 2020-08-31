import { toDataFrame, toDataFrameDTO } from '@grafana/data';
import { getDefautlOptions, stringJoinTransformer, StringJoinOptions, JoinSide, JoinWhen } from './stringJoin';

describe('string join', () => {
  const frameA = toDataFrame({
    refId: 'A',
    fields: [
      { name: 'A1', values: ['Aaa something', 'Bbb more', '🦥 prefix'] },
      { name: 'A2', values: [1, 2, 3] },
    ],
  });
  const frameB = toDataFrame({
    refId: 'B',
    fields: [
      { name: 'B1', values: ['AAA else', 'sloth 🦥', 'BBB somethign else'] },
      { name: 'B2', values: [5, 6, 7] },
    ],
  });
  const frames = [frameA, frameB];

  it('should pick reasonalbe defatuls', () => {
    const options = getDefautlOptions(frames);
    expect(options).toMatchInlineSnapshot(`
      Object {
        "ignoreCase": true,
        "left": Object {
          "fieldName": "A1",
          "frameIndex": 0,
          "regexp": "^\\\\S*",
        },
        "right": Object {
          "fieldName": "B1",
          "frameIndex": 1,
          "regexp": "^\\\\S*",
        },
        "side": "LeftRight",
        "when": "equals",
      }
    `);
  });

  it('right contains left', () => {
    const after = stringJoinTransformer.transformer({
      left: {
        fieldName: 'A1',
        frameIndex: 0,
        regexp: `^\\S*`, // first word
      },
      right: {
        fieldName: 'B1',
        frameIndex: 1,
        regexp: '', // nothing
      },
      side: JoinSide.RightLeft,
      when: JoinWhen.Contains,
      debug: false,
    } as StringJoinOptions)(frames);
    expect(after.map(f => toDataFrameDTO(f))).toMatchInlineSnapshot(`
      Array [
        Object {
          "fields": Array [
            Object {
              "config": Object {},
              "labels": undefined,
              "name": "A1",
              "type": "string",
              "values": Array [
                "Aaa something",
                "Bbb more",
                "🦥 prefix",
              ],
            },
            Object {
              "config": Object {},
              "labels": undefined,
              "name": "A2",
              "type": "number",
              "values": Array [
                1,
                2,
                3,
              ],
            },
            Object {
              "config": Object {},
              "labels": undefined,
              "name": "B1",
              "type": "string",
              "values": Array [
                "AAA else",
                "BBB somethign else",
                "sloth 🦥",
              ],
            },
            Object {
              "config": Object {},
              "labels": undefined,
              "name": "B2",
              "type": "number",
              "values": Array [
                5,
                7,
                6,
              ],
            },
          ],
          "meta": undefined,
          "name": undefined,
          "refId": "A",
        },
      ]
    `);
  });

  it('with debug info', () => {
    const after = stringJoinTransformer.transformer({
      debug: true,
    } as StringJoinOptions)(frames);
    expect(after.map(f => toDataFrameDTO(f))).toMatchInlineSnapshot(`
      Array [
        Object {
          "fields": Array [
            Object {
              "config": Object {},
              "labels": undefined,
              "name": "A1",
              "type": "string",
              "values": Array [
                "Aaa something",
                "Bbb more",
                "🦥 prefix",
              ],
            },
            Object {
              "config": Object {},
              "labels": undefined,
              "name": "Left norm",
              "type": "string",
              "values": Array [
                "Aaa",
                "Bbb",
                "🦥",
              ],
            },
            Object {
              "config": Object {},
              "labels": undefined,
              "name": "Matches",
              "type": "other",
              "values": Array [
                Array [
                  0,
                ],
                Array [
                  2,
                ],
                Array [],
              ],
            },
          ],
          "meta": undefined,
          "name": "Left",
          "refId": undefined,
        },
        Object {
          "fields": Array [
            Object {
              "config": Object {},
              "labels": undefined,
              "name": "B1",
              "type": "string",
              "values": Array [
                "AAA else",
                "sloth 🦥",
                "BBB somethign else",
              ],
            },
            Object {
              "config": Object {},
              "labels": undefined,
              "name": "Right norm",
              "type": "string",
              "values": Array [
                "AAA",
                "sloth",
                "BBB",
              ],
            },
          ],
          "meta": undefined,
          "name": "Right",
          "refId": undefined,
        },
      ]
    `);
  });

  it('support join by defautl', () => {
    const after = stringJoinTransformer.transformer({} as StringJoinOptions)(frames);
    expect(after.length).toEqual(1);
    expect(toDataFrameDTO(after[0])).toMatchInlineSnapshot(`
      Object {
        "fields": Array [
          Object {
            "config": Object {},
            "labels": undefined,
            "name": "A1",
            "type": "string",
            "values": Array [
              "Aaa something",
              "Bbb more",
              "🦥 prefix",
            ],
          },
          Object {
            "config": Object {},
            "labels": undefined,
            "name": "A2",
            "type": "number",
            "values": Array [
              1,
              2,
              3,
            ],
          },
          Object {
            "config": Object {},
            "labels": undefined,
            "name": "B1",
            "type": "string",
            "values": Array [
              "AAA else",
              "BBB somethign else",
              undefined,
            ],
          },
          Object {
            "config": Object {},
            "labels": undefined,
            "name": "B2",
            "type": "number",
            "values": Array [
              5,
              7,
              undefined,
            ],
          },
        ],
        "meta": undefined,
        "name": undefined,
        "refId": "A",
      }
    `);
  });
});
