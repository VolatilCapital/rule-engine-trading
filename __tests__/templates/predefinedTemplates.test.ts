import { describe, it, expect } from 'vitest';
import {
  SL_BREAKEVEN_TEMPLATE,
  TP_TEMPLATE,
  templateDefinitions,
} from '../../src/templates/predefinedTemplates.js';

describe('predefinedTemplates', () => {
  describe('SL_BREAKEVEN_TEMPLATE', () => {
    it('should have correct structure', () => {
      expect(SL_BREAKEVEN_TEMPLATE.id).toBe('sl-breakeven');
      expect(SL_BREAKEVEN_TEMPLATE.category).toBe('stop-loss');
      expect(SL_BREAKEVEN_TEMPLATE.parameters).toHaveLength(1);
      expect(SL_BREAKEVEN_TEMPLATE.parameters[0].name).toBe('thresholdR');
      expect(SL_BREAKEVEN_TEMPLATE.parameters[0].default).toBe(2);
    });

    it('should create template from definition', () => {
      const template = SL_BREAKEVEN_TEMPLATE.create({ thresholdR: 1.5 });
      expect(template).toBeDefined();
      expect(template.actions.length).toBeGreaterThan(0);
    });
  });

  describe('TP_TEMPLATE', () => {
    it('should have correct structure', () => {
      expect(TP_TEMPLATE.id).toBe('take-profit');
      expect(TP_TEMPLATE.category).toBe('take-profit');
      expect(TP_TEMPLATE.parameters[0].name).toBe('thresholdR');
      expect(TP_TEMPLATE.parameters[0].default).toBe(3);
    });
  });

  describe('templateDefinitions', () => {
    it('should contain at least 8 templates', () => {
      expect(Object.keys(templateDefinitions).length).toBeGreaterThanOrEqual(8);
    });

    it('should have sl-breakeven and take-profit indexed', () => {
      expect(templateDefinitions['sl-breakeven']).toBe(SL_BREAKEVEN_TEMPLATE);
      expect(templateDefinitions['take-profit']).toBe(TP_TEMPLATE);
    });

    it('every definition should have a create function', () => {
      for (const [key, def] of Object.entries(templateDefinitions)) {
        expect(def.create).toBeInstanceOf(Function);
        expect(def.id).toBe(key);
      }
    });
  });
});
