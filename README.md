# Case Insensitive Object
A case insensitive implementation of the Object class in TypeScript/JavaScript.

Inspired by Python CaseInsensitiveDict implementations.

While this module is written in TS, it does not fare well in strict TS mode.

## Install
| npm  | yarn |
| ------------- | ------------- |
| `npm install case-insensitive-object`  | `yarn add case-insensitive-object` |

## Usage
```typescript
import create, {CaseInsensitiveObject} from 'case-insensitive-object';

const obj = create({foo: 'bar'})  // This method is preferred
const obj2 = new CaseInsensitiveObject({foo: 'bar'}) // Less checking is available here... 
const obj3 = CaseInsensitiveObject.fromEntries([['foo', 'bar']])

console.log(obj['FOO'])           // -> 'bar'
console.log(obj['fOo'])           // -> 'bar'

obj['FoO'] = 'baz'                // Can reassign using any case
console.log(obj['foo'])           // -> 'baz'
console.log(Object.keys(obj))     // -> ['foo']

console.log('FoO' in obj)         // -> true

delete obj['FOO']
console.log(obj['foo'])           // -> undefined
```

## Idiosyncrasies
`Object.keys(new CaseInsensitiveObj({'FoO': bar})) == ['FoO']`

To allow a user to reconstruct the original object, we preserve the casing

## Contributing
Any contributing is welcome.



