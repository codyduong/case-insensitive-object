import create, { CaseInsensitiveObject } from '../src';

const __obj = {
  TEST: true,
};
const objI = create(__obj);

describe('Setting/Getting', () => {
  describe('Accessing Values', () => {
    test('Simple Accessors', () => {
      expect(objI['TEST']).toBe(true);
      expect(objI['test']).toBe(true);
      expect(objI['TeSt']).toBe(true);
    });
    test('in keyword', () => {
      expect('tEsT' in objI).toBe(true);
    });
  });
  describe('Keys', () => {
    test('Compare Keys', () => {
      //The keys will retain their case
      expect(Object.keys(objI)).toStrictEqual(Object.keys(__obj));
    });
    test('Overlapping Keys', () => {
      objI['OVERLAP'] = 0;
      objI['overlap'] = 1;
      expect(objI['OVERLAP']).toBe(1);
    });
  });
  describe('Key/Value Pair Assignment', () => {
    test('Create Key/Value Pair', () => {
      objI['TEST2'] = true;
      expect(objI['test2']).toBe(true);
    });
    test('Delete Key/Value Pair', () => {
      objI['DELETE'] = true;
      delete objI['delete'];
      expect(objI['DELETE']).toBe(undefined);
      expect(objI['delete']).toBe(undefined);
    });
    test('Delete Key/Value Pair (Empty)', () => {
      expect(delete objI['delete2']).toBe(true);
    });
  });
  describe('Object Static Methods', () => {
    test('assign(caseInsensitiveObject, object)', () => {
      const newAssigned = Object.assign(objI, { TEST3: true });
      expect(newAssigned['test3']).toBe(true);
    });
    test('assign(object, caseInsensitiveObject)', () => {
      const newAssigned = Object.assign({ TEST3: true }, objI);
      expect(newAssigned['test3']).toBe(undefined);
      expect(newAssigned['teSt']).toBe(undefined);
      expect(newAssigned['TEST3']).toBe(true);
      expect(newAssigned['TEST']).toBe(true);
    });
    test('create', () => {
      const newObject = Object.create(objI);
      expect(newObject['teSt']).toBe(true);
    });
    test('defineProperties', () => {
      const newObject = objI;
      Object.defineProperties(newObject, {
        PROPERTY: {
          value: true,
          writable: true,
        },
      });
      expect(newObject['PROPERTY']).toBe(true);
      expect(newObject['properTy']).toBe(true);
      newObject['properTy'] = false;
      expect(newObject['pRoperTy']).toBe(false);
    });
    test('defineProperty', () => {
      const newObject = objI;
      Object.defineProperty(newObject, 'PROPERTY', {
        value: true,
        writable: true,
      });
      expect(newObject['PROPERTY']).toBe(true);
      expect(newObject['properTy']).toBe(true);
      newObject['properTy'] = false;
      expect(newObject['pRoperTy']).toBe(false);
    });
    test('entries', () => {
      expect(Object.entries(create(__obj))).toStrictEqual(
        Object.entries(__obj)
      );
    });
    test('freeze', () => {
      const newObject = objI;
      Object.freeze(newObject);
      try {
        newObject['tEsT'] = false;
      } catch (e) {
        expect(e instanceof TypeError).toBe(true);
      }
      expect(newObject['teSt']).toBe(true);
    });
    test('fromEntries', () => {
      const newObject = CaseInsensitiveObject.fromEntries([
        ['foo', 'bar'],
        ['baz', 42],
      ]);
      expect(newObject['fOo']).toBe('bar');
      expect(newObject['bAz']).toBe(42);
    });
  });
});
