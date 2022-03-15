import { Split } from 'type-fest';

type WordSeparator = '-';

type InnerCamelCaseStringArray<
  Parts extends readonly any[],
  PreviousPart
> = Parts extends [`${infer FirstPart}`, ...infer RemainingParts]
  ? FirstPart extends undefined
    ? ''
    : FirstPart extends ''
    ? InnerCamelCaseStringArray<RemainingParts, PreviousPart>
    : `-${PreviousPart extends ''
        ? FirstPart
        : Capitalize<FirstPart>}${InnerCamelCaseStringArray<
        RemainingParts,
        FirstPart
      >}`
  : '';

type CamelCaseStringArray<Parts extends readonly string[]> = Parts extends [
  `${infer FirstPart}`,
  ...infer RemainingParts
]
  ? `${FirstPart}${InnerCamelCaseStringArray<RemainingParts, FirstPart>}`
  : never;

export type HTTPHeader<K> = K extends string
  ? Capitalize<
      CamelCaseStringArray<
        Split<K extends Uppercase<K> ? Lowercase<K> : K, WordSeparator>
      >
    >
  : K;

export type _AnyCase<T extends string> = string extends T
  ? string
  : T extends `${infer F1}${infer F2}${infer R}`
  ? `${Uppercase<F1> | Lowercase<F1>}${
      | Uppercase<F2>
      | Lowercase<F2>}${_AnyCase<R>}`
  : T extends `${infer F}${infer R}`
  ? `${Uppercase<F> | Lowercase<F>}${_AnyCase<R>}`
  : '';

export type AllCase<T extends Record<any, any>> = T & {
  [Key in keyof T as Key extends string ? Lowercase<Key> : Key]: T[Key];
} & {
  [Key in keyof T as Key extends string ? Uppercase<Key> : Key]: T[Key];
} & {
  [Key in keyof T as Key extends string ? HTTPHeader<Key> : Key]: T[Key];
} & {
  [Key in keyof T as Key extends string ? string : Key]: any;
} & {
  //[Key in keyof T as Key extends string ? AnyCase<Key> : Key]: T[Key]; This creates a too complex union
} & {
  // //@ts-expect-error: Allow implicit
  // get<U extends string>(string: AnyKeyCase<U, T>);
  // //@ts-expect-error: Allow implicit
  // set<U extends string>(
  //   string: AnyKeyCase<U, T>,
  //   value: T extends symbol | string ? T[keyof T] : any
  // );
};

export type AnyKeyCase<
  K extends symbol | string,
  T extends Record<string, any>
> = K extends string
  ? keyof T extends string
    ? Lowercase<K> extends Lowercase<keyof T>
      ? K
      : keyof T
    : K
  : K;
