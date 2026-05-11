import { describe, it, expect } from 'vitest';
import { createMoveStopLossAction } from '../../src/actions/moveStopLoss.js';
import { createPlaceOrderAction, createClosePositionAction } from '../../src/actions/placeOrder.js';
import { createCancelPositionAction } from '../../src/actions/cancelPosition.js';
import { createPartialCloseByPercentage } from '../../src/actions/partialClose.js';
import { ActionType } from '../../src/domain/TradingEnums.js';

describe('actions', () => {
  describe('createMoveStopLossAction', () => {
    it('should create with MOVE_STOP_LOSS actionRef', () => {
      const action = createMoveStopLossAction({ newStopPrice: { var: 'entryPrice' } });
      expect(action.actionRef).toBe(ActionType.MOVE_STOP_LOSS);
      expect(action.parameters.newStopPrice).toEqual({ var: 'entryPrice' });
    });
  });

  describe('createPlaceOrderAction', () => {
    it('should create with PLACE_ORDER actionRef', () => {
      const action = createPlaceOrderAction({ type: 'market' });
      expect(action.actionRef).toBe(ActionType.PLACE_ORDER);
      expect(action.parameters.type).toBe('market');
    });
  });

  describe('createClosePositionAction', () => {
    it('should create with PLACE_ORDER actionRef and close_position type', () => {
      const action = createClosePositionAction();
      expect(action.actionRef).toBe(ActionType.PLACE_ORDER);
      expect(action.parameters.type).toBe('close_position');
    });
  });

  describe('createCancelPositionAction', () => {
    it('should create with CANCEL_POSITION actionRef', () => {
      const action = createCancelPositionAction();
      expect(action.actionRef).toBe(ActionType.CANCEL_POSITION);
    });
  });

  describe('createPartialCloseByPercentage', () => {
    it('should create with PARTIAL_CLOSE actionRef', () => {
      const action = createPartialCloseByPercentage({ percentage: 50 });
      expect(action.actionRef).toBe(ActionType.PARTIAL_CLOSE);
      expect(action.parameters.percentage).toBe(50);
    });
  });
});
