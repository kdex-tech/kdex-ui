import { describe, expect, it } from 'vitest';
import { AppElement } from './app-element';

if (!customElements.get('app-element')) {
  customElements.define('app-element', AppElement);
}

describe('AppElement', () => {
  it('should need to be implemented', () => {
    const result = new AppElement();

    expect(result).not.toBeNull();
  });
});