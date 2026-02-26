import { describe, it, expect } from '@jest/globals';
import { healthCheck } from '../src/index.mjs';

describe('smoke tests', () => {
  it('healthCheck returns ok status', () => {
    const result = healthCheck();
    expect(result).toHaveProperty('status', 'ok');
    expect(result).toHaveProperty('timestamp');
  });
});
