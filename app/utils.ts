export function classNames(...args: (string | string[] | undefined | false)[]) {
  return args.filter(Boolean).flat().join(" ");
}

export function generateIndexArray(length: number) {
  let array: number[] = [];

  for (let i = 0; i < length; i++) {
    array.push(i);
  }

  return array;
}
