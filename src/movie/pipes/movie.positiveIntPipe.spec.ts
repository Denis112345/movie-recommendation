import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { PositiveIntPipe } from './movie.positiveIntPipe';

describe('PositiveIntPipe', () => {
  let pipe: PositiveIntPipe;

  beforeEach(() => {
    pipe = new PositiveIntPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    const metadata: ArgumentMetadata = {
      type: 'param',
      metatype: Number,
      data: 'id'
    };

    it('should return valid positive integer', () => {
      expect(pipe.transform('5', metadata)).toBe(5);
      expect(pipe.transform('42', metadata)).toBe(42);
      expect(pipe.transform('100', metadata)).toBe(100);
    });

    it('should return valid positive integer when passed as number', () => {
      expect(pipe.transform(5, metadata)).toBe(5);
      expect(pipe.transform(42, metadata)).toBe(42);
      expect(pipe.transform(100, metadata)).toBe(100);
    });

    it('should throw BadRequestException for zero', () => {
      expect(() => pipe.transform('0', metadata)).toThrow(BadRequestException);
      expect(() => pipe.transform('0', metadata)).toThrow('Аргумент должен быть положитекльным числом, получили 0');
      expect(() => pipe.transform(0, metadata)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for negative numbers', () => {
      expect(() => pipe.transform('-1', metadata)).toThrow(BadRequestException);
      expect(() => pipe.transform('-5', metadata)).toThrow('Аргумент должен быть положитекльным числом, получили -5');
      expect(() => pipe.transform(-10, metadata)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-numeric strings', () => {
      expect(() => pipe.transform('abc', metadata)).toThrow(BadRequestException);
      expect(() => pipe.transform('abc', metadata)).toThrow('Аргумент должен быть положитекльным числом, получили abc');
      expect(() => pipe.transform('12abc', metadata)).toThrow(BadRequestException);
      expect(() => pipe.transform('12.5', metadata)).toThrow(BadRequestException);
      expect(() => pipe.transform('', metadata)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for NaN', () => {
      expect(() => pipe.transform(NaN, metadata)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for null', () => {
      expect(() => pipe.transform(null, metadata)).toThrow(BadRequestException);
      expect(() => pipe.transform(null, metadata)).toThrow('Аргумент должен быть положитекльным числом, получили null');
    });

    it('should throw BadRequestException for undefined', () => {
      expect(() => pipe.transform(undefined, metadata)).toThrow(BadRequestException);
      expect(() => pipe.transform(undefined, metadata)).toThrow('Аргумент должен быть положитекльным числом, получили undefined');
    });

    it('should handle decimal strings by throwing error', () => {
      expect(() => pipe.transform('3.14', metadata)).toThrow(BadRequestException);
      expect(() => pipe.transform('3.14', metadata)).toThrow('Аргумент должен быть положитекльным числом, получили 3.14');
    });

    it('should handle floating point numbers by throwing error', () => {
      expect(() => pipe.transform(3.14, metadata)).toThrow(BadRequestException);
      expect(() => pipe.transform(0.5, metadata)).toThrow(BadRequestException);
    });

    it('should work with different metadata types', () => {
      const queryMetadata: ArgumentMetadata = {
        type: 'query',
        metatype: Number,
        data: 'limit'
      };

      expect(pipe.transform('10', queryMetadata)).toBe(10);
    });

    it('should handle string numbers with whitespace', () => {
      expect(() => pipe.transform(' 5 ', metadata)).toThrow(BadRequestException);
      expect(() => pipe.transform('\n10\n', metadata)).toThrow(BadRequestException);
    });

    it('should handle very large numbers', () => {
      expect(pipe.transform('999999999', metadata)).toBe(999999999);
      expect(pipe.transform(999999999, metadata)).toBe(999999999);
    });
  });
});
