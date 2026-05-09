import { describe, it, expect } from 'vitest';
import {
  SL_BREAKEVEN_TEMPLATE,
  TP_TEMPLATE,
  templateDefinitions,
} from '../../src/templates/predefinedTemplates.js';

describe('predefinedTemplates', () => {
  describe('SL_BREAKEVEN_TEMPLATE', () => {
    it('should have correct structure with split measurement params', () => {
      expect(SL_BREAKEVEN_TEMPLATE.id).toBe('sl-breakeven');
      expect(SL_BREAKEVEN_TEMPLATE.category).toBe('stop-loss');
      const names = SL_BREAKEVEN_TEMPLATE.parameters.map((p) => p.name);
      expect(names).toContain('thresholdValue');
      expect(names).toContain('thresholdUnit');
    });

    it('should create template from flat params', () => {
      const template = SL_BREAKEVEN_TEMPLATE.create({
        thresholdValue: 1.5,
        thresholdUnit: 'R',
      });
      expect(template).toBeDefined();
      expect(template.actions.length).toBeGreaterThan(0);
    });

    it('should create template using percent unit', () => {
      const template = SL_BREAKEVEN_TEMPLATE.create({
        thresholdValue: 1.5,
        thresholdUnit: 'percent',
      });
      expect(template).toBeDefined();
    });
  });

  describe('TP_TEMPLATE', () => {
    it('should have correct structure', () => {
      expect(TP_TEMPLATE.id).toBe('take-profit');
      expect(TP_TEMPLATE.category).toBe('take-profit');
      const names = TP_TEMPLATE.parameters.map((p) => p.name);
      expect(names).toContain('thresholdValue');
      expect(names).toContain('thresholdUnit');
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
