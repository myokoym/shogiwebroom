/**
 * Unit tests for store/sfen.js
 * Tests the core Shogi board state management
 */

describe('store/sfen', () => {
  let stateFactory;
  let mutations;
  let state;

  beforeAll(() => {
    // Dynamically require the module
    const sfenStore = require('../../../stores/sfen');
    stateFactory = sfenStore.state;
    mutations = sfenStore.mutations;
  });

  beforeEach(() => {
    // Create fresh state for each test
    state = stateFactory();
  });

  describe('state', () => {
    test('should have initial state', () => {
      expect(state.roomId).toBe('');
      expect(state.text).toBe('lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1');
      expect(state.rows).toEqual(Array(9).fill(null).map(() => Array(9).fill(null)));
      expect(state.blackHands).toEqual({});
      expect(state.whiteHands).toEqual({});
      expect(state.stock).toEqual([]);
      expect(state.latestX).toBe(-1);
      expect(state.latestY).toBe(-1);
      expect(state.history).toEqual([]);
      expect(state.historyIndex).toBe(-1);
    });

    test('should have stock pieces defined', () => {
      // Note: stock is initialized as empty in state, filled by fillStock action
      expect(state.stock).toEqual([]);
    });
  });

  describe('mutations', () => {
    describe('init', () => {
      test('should set initial board position', () => {
        mutations.init(state);
        
        const expectedSfen = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b -';
        expect(state.text).toBe(expectedSfen);
        expect(state.history).toEqual([expectedSfen]);
        expect(state.historyIndex).toBe(0);
      });

      test('should not reinitialize if text already exists', () => {
        state.text = 'existing position';
        mutations.init(state);
        
        expect(state.text).toBe('existing position');
        expect(state.history).toEqual([]);
      });
    });

    describe('setRoomId', () => {
      test('should set room ID', () => {
        mutations.setRoomId(state, { roomId: 'test-room-123' });
        expect(state.roomId).toBe('test-room-123');
      });
    });

    describe('setText', () => {
      test('should set SFEN text', () => {
        const sfen = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w -';
        mutations.setText(state, { text: sfen });
        expect(state.text).toBe(sfen);
      });
    });

    describe('receiveText', () => {
      test('should receive and set SFEN text', () => {
        const sfen = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w -';
        mutations.receiveText(state, { text: sfen });
        expect(state.text).toBe(sfen);
      });
    });

    describe('reverse', () => {
      test('should toggle board reversal', () => {
        // Note: reversed state is added dynamically in the mutation
        mutations.reverse(state);
        expect(state.reversed).toBe(true);
        mutations.reverse(state);
        expect(state.reversed).toBe(false);
      });
    });

    describe('moveBoardToBoard', () => {
      beforeEach(() => {
        // Set up a simple board position for testing
        state.rows = [
          [null, null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null, null],
          ['P', null, null, null, null, null, null, null, null], // Black pawn at (0,6)
          [null, null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null, null]
        ];
        state.blackHands = {};
        state.whiteHands = {};
        state.hands = {};
        state.currentTurn = 'b';
      });

      test('should move piece from one position to another', () => {
        mutations.moveBoardToBoard(state, {
          beforeX: 0, beforeY: 6,
          afterX: 0, afterY: 5,
          piece: 'P'
        });

        expect(state.rows[6][0]).toBe(null);
        expect(state.rows[5][0]).toBe('P');
        expect(state.latestX).toBe(0);
        expect(state.latestY).toBe(5);
      });

      test('should capture opponent piece', () => {
        state.rows[5][0] = 'p'; // White pawn to capture

        mutations.moveBoardToBoard(state, {
          beforeX: 0, beforeY: 6,
          afterX: 0, afterY: 5,
          piece: 'P'
        });

        expect(state.rows[5][0]).toBe('P');
        expect(state.hands['P']).toBe(1); // Captured pawn added to hand
      });

      test('should not allow capturing own piece', () => {
        state.rows[5][0] = 'L'; // Black lance (same color)

        mutations.moveBoardToBoard(state, {
          beforeX: 0, beforeY: 6,
          afterX: 0, afterY: 5,
          piece: 'P'
        });

        // Move should not happen
        expect(state.rows[6][0]).toBe('P');
        expect(state.rows[5][0]).toBe('L');
      });

      test('should demote promoted piece when captured', () => {
        state.rows[5][0] = '+p'; // Promoted white pawn

        mutations.moveBoardToBoard(state, {
          beforeX: 0, beforeY: 6,
          afterX: 0, afterY: 5,
          piece: 'P'
        });

        expect(state.hands['P']).toBe(1); // Demoted to regular pawn
      });
    });

    describe('moveHandToBoard', () => {
      beforeEach(() => {
        state.rows = Array(9).fill(null).map(() => Array(9).fill(null));
        state.hands = { 'P': 2, 'p': 1 }; // Black has 2 pawns, white has 1
        state.currentTurn = 'b';
      });

      test('should place piece from hand to empty square', () => {
        mutations.moveHandToBoard(state, {
          beforeHand: 'P',
          afterX: 4, afterY: 4
        });

        expect(state.rows[4][4]).toBe('P');
        expect(state.hands['P']).toBe(1);
        expect(state.currentTurn).toBe('w');
        expect(state.latestX).toBe(4);
        expect(state.latestY).toBe(4);
      });

      test('should not place piece on occupied square', () => {
        state.rows[4][4] = 'L';

        mutations.moveHandToBoard(state, {
          beforeHand: 'P',
          afterX: 4, afterY: 4
        });

        expect(state.rows[4][4]).toBe('L'); // Unchanged
        expect(state.hands['P']).toBe(2); // Unchanged
      });

      test('should not place piece if not in hand', () => {
        mutations.moveHandToBoard(state, {
          beforeHand: 'R', // Rook not in hand
          afterX: 4, afterY: 4
        });

        expect(state.rows[4][4]).toBe(null);
        expect(state.hands['R']).toBeUndefined();
      });

      test('should remove piece from hands when count reaches zero', () => {
        state.hands = { 'P': 1 };

        mutations.moveHandToBoard(state, {
          beforeHand: 'P',
          afterX: 4, afterY: 4
        });

        expect(state.hands['P']).toBeUndefined();
      });
    });
  });
});