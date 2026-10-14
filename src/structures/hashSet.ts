import source from './hashSet.example.ts?raw';
import { build, plural, type Mark, type OpRun, type Operation, type StructureInfo } from './types';

/** One array per bucket. A mark's `at` is the bucket, and `entry` a value within it. */
export interface HashSetState {
  buckets: number[][];
}

const copy = (buckets: number[][]) => buckets.map((b) => [...b]);
const frame = (buckets: number[][], line: string, message: string, marks: Mark[] = []) => ({
  state: { buckets: copy(buckets) },
  line,
  message,
  marks,
});

const count = (buckets: number[][]) => buckets.reduce((n, b) => n + b.length, 0);
const show = (bucket: number[]) => (bucket.length === 0 ? 'nothing' : bucket.join(', '));

function* hash(buckets: number[][], value: number) {
  const b = value % buckets.length;
  yield frame(
    buckets,
    'hash',
    `Hash ${value}: ${value} % ${buckets.length} buckets = ${b}. Only bucket ${b} can hold it, so that is the only place to look.`,
    [{ at: b, tone: 'look' }],
  );
  return b;
}

function* add(state: HashSetState, value: number): OpRun<HashSetState> {
  let buckets = copy(state.buckets);
  const b = yield* hash(buckets, value);
  const bucket = buckets[b];

  if (bucket.includes(value)) {
    yield frame(buckets, 'add-duplicate', `Bucket ${b} already holds ${value}. A set keeps each value once, so nothing changes.`, [
      { at: b, entry: bucket.indexOf(value), tone: 'look' },
    ]);
    return { state: { buckets } };
  }

  bucket.push(value);
  yield frame(
    buckets,
    'add',
    bucket.length === 1
      ? `Bucket ${b} was empty. ${value} goes in.`
      : `Bucket ${b} held ${show(bucket.slice(0, -1))}, not ${value}. Add it to the end of the bucket. Two values sharing a bucket is a collision, and chaining them like this is how it is handled.`,
    [{ at: b, entry: bucket.length - 1, tone: 'add' }],
  );

  const size = count(buckets);
  if (size > buckets.length * 0.75) {
    const old = buckets;
    buckets = Array.from({ length: old.length * 2 }, () => []);
    yield frame(
      buckets,
      'resize',
      `${plural(size, 'value')} in ${old.length} buckets is more than 0.75 per bucket, so chains will start getting long. Make ${buckets.length} empty buckets. The bucket count is part of the hash, so every value has to be hashed again.`,
    );
    for (const oldBucket of old) {
      for (const v of oldBucket) {
        const nb = v % buckets.length;
        buckets[nb].push(v);
        yield frame(
          buckets,
          'rehash',
          `Move ${v}: ${v} % ${buckets.length} = ${nb}, so it goes to bucket ${nb}.`,
          [{ at: nb, entry: buckets[nb].length - 1, tone: 'add' }],
        );
      }
    }
  }
  return { state: { buckets } };
}

function* has({ buckets }: HashSetState, value: number): OpRun<HashSetState> {
  const b = yield* hash(buckets, value);
  const i = buckets[b].indexOf(value);
  yield frame(
    buckets,
    'has',
    i === -1
      ? `Bucket ${b} holds ${show(buckets[b])}. No ${value}, so has returns false, without looking at any other bucket.`
      : `Bucket ${b} holds ${value}. Has returns true.`,
    i === -1 ? [{ at: b, tone: 'look' }] : [{ at: b, entry: i, tone: 'add' }],
  );
  return { state: { buckets }, result: i !== -1 };
}

function* remove(state: HashSetState, value: number): OpRun<HashSetState> {
  const buckets = copy(state.buckets);
  const b = yield* hash(buckets, value);
  const i = buckets[b].indexOf(value);
  if (i === -1) {
    yield frame(buckets, 'delete-missing', `Bucket ${b} holds ${show(buckets[b])}. ${value} is not there, so delete returns false.`, [
      { at: b, tone: 'look' },
    ]);
    return { state: { buckets }, result: false };
  }
  yield frame(buckets, 'delete', `Found ${value} in bucket ${b}. Take it out.`, [{ at: b, entry: i, tone: 'remove' }]);
  buckets[b].splice(i, 1);
  yield frame(buckets, 'delete', `${value} is gone. Delete returns true.`, [{ at: b, tone: 'look' }]);
  return { state: { buckets }, result: true };
}

const addOp: Operation<HashSetState> = {
  id: 'add', label: 'Add', takesValue: true, grows: true, complexity: 'O(1) on average', run: add,
};

export const hashSet: StructureInfo<HashSetState> = {
  id: 'hash-set',
  name: 'Hash set',
  description:
    'Answers "is this value in here?" in one step on average, by using the value itself to work out where it is stored.',
  source,
  empty: { buckets: [[], [], [], []] },
  initial: build({ buckets: [[], [], [], []] }, addOp, [12, 7, 21]),
  size: (s) => count(s.buckets),
  capacity: 12,
  operations: [
    addOp,
    { id: 'has', label: 'Has', takesValue: true, complexity: 'O(1) on average', run: has },
    { id: 'delete', label: 'Delete', takesValue: true, complexity: 'O(1) on average', run: remove },
  ],
};
