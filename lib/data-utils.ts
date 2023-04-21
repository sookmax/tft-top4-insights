import path from "path";

export const DATA_DIR_ROOT = path.join(process.cwd(), "data");

export function generateRandomIndex(max: number) {
  const x = Math.random();
  const index = Math.floor(x * (max + 1));
  return index;
}

export function aggregateById<T extends { id: string | number; count: number }>(
  array: T[],
  onIteration?: (filteredArray: T[], item: Pick<T, "id" | "count">) => T,
  truncate?: number
) {
  // const arrayFlatten = array.flat();
  const uniqueArray: T[] = [];
  const uniqueIds = [...new Set(array.map((item) => item.id))];

  for (const id of uniqueIds) {
    const filteredArray = array.filter((item) => item.id === id);
    const item = {
      id,
      count: filteredArray
        .map((item) => item.count)
        .reduce((acc, curr) => {
          acc += curr;
          return acc;
        }),
    };

    uniqueArray.push(
      onIteration ? onIteration(filteredArray, item) : (item as T)
    );
  }

  uniqueArray.sort((a, b) => {
    if (a.count > b.count) {
      return -1;
    } else if (a.count < b.count) {
      return 1;
    } else {
      return 0;
    }
  });

  if (truncate) {
    return uniqueArray.filter((_, idx) => idx < truncate);
  } else {
    return uniqueArray;
  }
}
