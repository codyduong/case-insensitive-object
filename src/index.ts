type _AnyCase<T extends string> = string extends T
  ? string
  : T extends `${infer F1}${infer F2}${infer R}`
  ? `${Uppercase<F1> | Lowercase<F1>}${
      | Uppercase<F2>
      | Lowercase<F2>}${_AnyCase<R>}`
  : T extends `${infer F}${infer R}`
  ? `${Uppercase<F> | Lowercase<F>}${_AnyCase<R>}`
  : '';

type AllCase<T> = T & {
  [Key in keyof T as Key extends string ? Lowercase<Key> : Key]: T[Key];
} & {
  [Key in keyof T as Key extends string
    ? Capitalize<Lowercase<Key>>
    : Key]: T[Key];
} & {
  [Key in keyof T as Key extends string ? Uppercase<Key> : Key]: T[Key];
} & {
  [Key in keyof T as Key extends string ? Capitalize<Key> : Key]: T[Key];
} & {
  [Key in keyof T as Key extends string ? string : Key]: any;
} & {
  //[Key in keyof T as Key extends string ? AnyCase<Key> : Key]: T[Key]; This creates a too complex union
};

export default function CaseInsensitiveObjectFactory<
  T extends Record<any, any>
>(value: T): AllCase<T> {
  return new CaseInsensitiveObject(value) as unknown as AllCase<T>;
}

type AnyKeyCase<
  K extends keyof T,
  T extends Record<string, any>
> = K extends string
  ? keyof T extends string
    ? Lowercase<K> extends Lowercase<keyof T>
      ? K
      : keyof T
    : K
  : K;

export class CaseInsensitiveObject<T extends Record<any, any>> extends Object {
  #keys: (keyof T)[] = [];
  #insensitiveKeys: (keyof T)[] = [];
  constructor(value: T) {
    const proxyObject = new Proxy(value, {
      set: <K extends keyof T>(
        target: object,
        prop: AnyKeyCase<K, T>,
        value: any,
        receiver: any
      ): boolean => {
        const newProp = typeof prop == 'string' ? prop.toLowerCase() : prop;
        const insensitiveKeyIndex = this.#insensitiveKeys.indexOf(newProp);
        if (insensitiveKeyIndex >= 0) {
          //We already have set this key/value pair
          const returnValue = Reflect.set(
            target,
            this.#keys[insensitiveKeyIndex],
            value,
            receiver
          );
          if (!returnValue && Object.isFrozen(target)) {
            throw new TypeError(
              `Cannot add property ${prop}, object is not extensible`
            );
          }
          return returnValue;
        } else {
          //We have not set this key/value pair
          this.#keys.push(prop);
          this.#insensitiveKeys.push(newProp);
          return Reflect.set(target, prop, value, receiver);
        }
      },
      get: (target, prop, receiver): typeof target[keyof typeof target] => {
        const newProp = typeof prop == 'string' ? prop.toLowerCase() : prop;
        const returnValue = Reflect.get(
          target,
          this.#keys[this.#insensitiveKeys.indexOf(newProp)],
          receiver
        );
        return returnValue;
      },
      deleteProperty: (target, prop): boolean => {
        const newProp = typeof prop == 'string' ? prop.toLowerCase() : prop;
        const insensitiveKeyIndex = this.#insensitiveKeys.indexOf(newProp);
        let returnValue = true;
        if (insensitiveKeyIndex >= 0) {
          returnValue = Reflect.deleteProperty(
            target,
            this.#keys[insensitiveKeyIndex]
          );
          //remove old keys
          this.#keys.splice(insensitiveKeyIndex, 1);
          this.#insensitiveKeys.splice(insensitiveKeyIndex, 1);
        }
        return returnValue;
      },
      defineProperty: (target, prop, descriptor): boolean => {
        const newProp = typeof prop == 'string' ? prop.toLowerCase() : prop;
        const insensitiveKeyIndex = this.#insensitiveKeys.indexOf(newProp);
        if (insensitiveKeyIndex >= 0) {
          //We already set this key
          return Reflect.defineProperty(
            target,
            this.#keys[insensitiveKeyIndex],
            descriptor
          );
        } else {
          this.#keys.push(prop);
          this.#insensitiveKeys.push(newProp);
          return Reflect.defineProperty(target, prop, descriptor);
        }
      },
      // getOwnPropertyDescriptor: (
      //   target,
      //   prop
      // ): PropertyDescriptor | undefined => {
      //   const newProp = typeof prop == 'string' ? prop.toLowerCase() : prop;
      //   return Reflect.getOwnPropertyDescriptor(target, newProp);
      // },
      has: (target, prop): boolean => {
        const newProp = typeof prop == 'string' ? prop.toLowerCase() : prop;
        const insensitiveKeyIndex = this.#insensitiveKeys.indexOf(newProp);
        if (insensitiveKeyIndex >= 0) {
          return true;
        } else {
          return false;
        }
      },
    });
    super(proxyObject);
    this.#keys = Object.keys(value);
    this.#insensitiveKeys = Object.keys(value).map((value) =>
      typeof value == 'string' ? value.toLowerCase() : value
    );
    //@ts-expect-error: We override the constructor return
    return proxyObject as unknown as AllCase<T>;
  }
  [x: string]: any;

  static fromEntries<T = any>(
    entries: Iterable<readonly [PropertyKey, T]>
  ): { [k: string]: T };
  static fromEntries(entries: Iterable<readonly any[]>): any;
  static fromEntries(entries: Iterable<readonly any[]>): any {
    return new this(Object.fromEntries(entries));
  }
}
