import { bst } from './bst';
import { linkedList } from './linkedList';
import { queue } from './queue';
import { stack } from './stack';
import type { StructureInfo } from './types';

/**
 * Add a structure here and it shows up in the UI. Each one has its own state
 * shape, so the list is typed loosely; each entry is fully typed in its file.
 */
export const structures: StructureInfo<any>[] = [stack, queue, linkedList, bst];
