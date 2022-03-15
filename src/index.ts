import { AllCase, AnyKeyCase } from './types';

export default function CaseInsensitiveObjectFactory<
  T extends Record<any, any>
>(value: T): CaseInsensitiveObject<T> & AllCase<T> {
  return new CaseInsensitiveObject(value) as CaseInsensitiveObject<T> &
    AllCase<T>;
}

/**
 * It is highly recommended to use the default export of this module instead,
 * the CaseInsensitiveObjectFactory to construct a new CaseInsensitiveObject Instance.
 * Type-hints will not be available if you construct using this class.
 * Otherwise use this class for static methods.
 */
export class CaseInsensitiveObject<T extends Record<any, any>> {
  #keys: (keyof T)[] = [];
  #insensitiveKeys: (keyof T)[] = [];
  constructor(value: T) {
    const proxyObject = new Proxy(value, {
      set: <K extends symbol | string>(
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
    this.#keys = Object.keys(value);
    this.#insensitiveKeys = Object.keys(value).map((value) =>
      typeof value == 'string' ? value.toLowerCase() : value
    );
    return Object.assign(proxyObject, {
      // get<U extends string>(string: AnyKeyCase<U, T>): T[U] {
      //   //@ts-expect-error: Sure it can
      //   return this[string];
      // },
      // set<U extends string>(
      //   string: AnyKeyCase<U, T>,
      //   value: T extends symbol | string ? T[keyof T] : any
      // ) {
      //   //@ts-expect-error: Sure it can
      //   this[string] = value;
      // },
    }) as unknown as CaseInsensitiveObject<T> & AllCase<T>;
  }

  static fromEntries<T = any>(
    entries: Iterable<readonly [PropertyKey, T]>
  ): { [k: string]: T };
  static fromEntries(entries: Iterable<readonly any[]>): any;
  static fromEntries(entries: Iterable<readonly any[]>): any {
    return new this(Object.fromEntries(entries));
  }
}
