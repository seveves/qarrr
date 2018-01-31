export function min<T>(arr: T[], gt: (min: T, cur: T) => boolean) {
  return arr.slice(1).reduce((min, cur) => gt(min, cur)?cur:min, arr[0]);
}

export function chunks<T>(arr: T[], size: number): T[][] {
  let output: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    output.push(arr.slice(i, i + size));
  }
  return output;
}

export function btd(binary: string): number {
  return parseInt(binary, 2);
}

export function dtb(decimal: number, padleft?: number): string {
  let binary = decimal.toString(2)
  if (padleft !== undefined && padleft !== null && padleft >= 0) {
     binary = Array.from({ length: padleft }, (v, k) => '0').join().concat(binary);
  }
  return binary;
}

export function groupBy<T>(arr: T[], key: string): {[key: string]: T[]} {
  return arr.reduce((p, c) => {
    p[c[key]] = p[c[key]] || []
    p[c[key]].push(c);
    return p;
  }, {} as {[key: string]: T[]});
};
