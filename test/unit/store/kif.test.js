/**
 * Unit tests for store/kif.js
 * Tests the game record (kifu) management
 */

describe('store/kif', () => {
  let stateFactory;
  let mutations;
  let state;

  beforeAll(() => {
    // Dynamically require the module
    const kifStore = require('../../../store/kif');
    stateFactory = kifStore.state;
    mutations = kifStore.mutations;
  });

  beforeEach(() => {
    state = stateFactory();
  });

  describe('state', () => {
    test('should have initial state', () => {
      expect(state.beforeX).toBeUndefined();
      expect(state.beforeY).toBeUndefined();
      expect(state.afterX).toBeUndefined();
      expect(state.afterY).toBeUndefined();
      expect(state.piece).toBeUndefined();
      expect(state.moves).toEqual([]);
      expect(state.kifs).toEqual([]);
      expect(state.ki2s).toEqual([]);
      expect(state.pause).toBe(false);
    });

    test('should have correct coordinate mappings', () => {
      // X coordinates (columns) - right to left in Japanese notation
      expect(state.xChars['1']).toBe('１');
      expect(state.xChars['5']).toBe('５');
      expect(state.xChars['9']).toBe('９');

      // Y coordinates (rows) - kanji numbers
      expect(state.yChars['1']).toBe('一');
      expect(state.yChars['5']).toBe('五');
      expect(state.yChars['9']).toBe('九');
    });

    test('should have correct piece name mappings', () => {
      // Regular pieces
      expect(state.komaChars['K']).toBe('玉'); // King
      expect(state.komaChars['G']).toBe('金'); // Gold
      expect(state.komaChars['S']).toBe('銀'); // Silver
      expect(state.komaChars['N']).toBe('桂'); // Knight
      expect(state.komaChars['L']).toBe('香'); // Lance
      expect(state.komaChars['R']).toBe('飛'); // Rook
      expect(state.komaChars['B']).toBe('角'); // Bishop
      expect(state.komaChars['P']).toBe('歩'); // Pawn

      // Promoted pieces
      expect(state.komaChars['+S']).toBe('成銀'); // Promoted Silver
      expect(state.komaChars['+N']).toBe('成桂'); // Promoted Knight
      expect(state.komaChars['+L']).toBe('成香'); // Promoted Lance
      expect(state.komaChars['+R']).toBe('竜');   // Dragon (Promoted Rook)
      expect(state.komaChars['+B']).toBe('馬');   // Horse (Promoted Bishop)
      expect(state.komaChars['+P']).toBe('と');   // Tokin (Promoted Pawn)
    });
  });

  describe('mutations', () => {
    describe('reset', () => {
      test('should reset all game records', () => {
        // Add some data first
        state.moves = [{ move: 1 }];
        state.kifs = ['７六歩'];
        state.ki2s = ['▲７六歩'];

        mutations.reset(state);

        expect(state.moves).toEqual([]);
        expect(state.kifs).toEqual([]);
        expect(state.ki2s).toEqual([]);
      });
    });

    describe('receiveMove', () => {
      test('should add move to history with KIF notation', () => {
        const moveData = {
          time: '14:30:00',
          beforeX: '2',
          beforeY: '6',
          afterX: '2',
          afterY: '5',
          piece: 'P'
        };

        mutations.receiveMove(state, moveData);

        expect(state.moves).toHaveLength(1);
        expect(state.moves[0]).toEqual({
          time: '14:30:00',
          beforeX: '2',
          beforeY: '6',
          afterX: '2',
          afterY: '5',
          piece: 'P'
        });

        // Check KIF notation (２五歩(26))
        expect(state.kifs).toHaveLength(1);
        expect(state.kifs[0]).toBe('２五歩(26)');

        // Check KI2 notation (▲２五歩)
        expect(state.ki2s).toHaveLength(1);
        expect(state.ki2s[0]).toBe('▲２五歩');
      });

      test('should handle piece drops (from hand)', () => {
        const dropMove = {
          time: '14:31:00',
          beforeX: undefined,
          beforeY: undefined,
          afterX: '5',
          afterY: '5',
          piece: 'P'
        };

        mutations.receiveMove(state, dropMove);

        expect(state.kifs[0]).toBe('５五歩打');
        expect(state.ki2s[0]).toBe('▲５五歩打');
      });

      test('should handle white pieces with triangle symbol', () => {
        const whiteMove = {
          time: '14:32:00',
          beforeX: '8',
          beforeY: '2',
          afterX: '8',
          afterY: '3',
          piece: 'p' // lowercase for white
        };

        mutations.receiveMove(state, whiteMove);

        expect(state.ki2s[0]).toBe('△８三歩');
      });

      test('should not add move when paused', () => {
        state.pause = true;

        const moveData = {
          time: '14:33:00',
          beforeX: '7',
          beforeY: '6',
          afterX: '7',
          afterY: '5',
          piece: 'P'
        };

        mutations.receiveMove(state, moveData);

        expect(state.moves).toHaveLength(0);
        expect(state.kifs).toHaveLength(0);
        expect(state.ki2s).toHaveLength(0);
      });
    });

    describe('sendMove', () => {
      test('should prepare move data for sending', () => {
        const moveParams = {
          beforeX: 7,
          beforeY: 6,
          afterX: 7,
          afterY: 5,
          piece: 'P',
          reversed: false
        };

        mutations.sendMove(state, moveParams);

        // Coordinates are converted for SFEN format (9 - x, 1 + y)
        expect(state.beforeX).toBe('2'); // 9 - 7 = 2
        expect(state.beforeY).toBe('7'); // 1 + 6 = 7
        expect(state.afterX).toBe('2');  // 9 - 7 = 2
        expect(state.afterY).toBe('6');  // 1 + 5 = 6
        expect(state.piece).toBe('P');
      });

      test('should handle reversed board', () => {
        const moveParams = {
          beforeX: 2,
          beforeY: 2,
          afterX: 2,
          afterY: 3,
          piece: 'P',
          reversed: true
        };

        mutations.sendMove(state, moveParams);

        // With reversal: coordinates are flipped (8 - x, 8 - y)
        // Then converted: (9 - flipped_x, 1 + flipped_y)
        expect(state.beforeX).toBe('3'); // 9 - (8 - 2) = 3
        expect(state.beforeY).toBe('7'); // 1 + (8 - 2) = 7
        expect(state.afterX).toBe('3');  // 9 - (8 - 2) = 3
        expect(state.afterY).toBe('6');  // 1 + (8 - 3) = 6
        expect(state.piece).toBe('p'); // Changed to lowercase (white)
      });

      test('should handle piece drops (no before coordinates)', () => {
        const dropMove = {
          beforeX: undefined,
          beforeY: undefined,
          afterX: 5,
          afterY: 5,
          piece: 'P',
          reversed: false
        };

        mutations.sendMove(state, dropMove);

        expect(state.beforeX).toBeUndefined();
        expect(state.beforeY).toBeUndefined();
        expect(state.afterX).toBe('4');  // 9 - 5 = 4
        expect(state.afterY).toBe('6');  // 1 + 5 = 6
        expect(state.piece).toBe('P');
      });

      test('should not send move when paused', () => {
        state.pause = true;

        const moveParams = {
          beforeX: 7,
          beforeY: 6,
          afterX: 7,
          afterY: 5,
          piece: 'P',
          reversed: false
        };

        mutations.sendMove(state, moveParams);

        // State should remain unchanged
        expect(state.beforeX).toBeUndefined();
        expect(state.beforeY).toBeUndefined();
        expect(state.afterX).toBeUndefined();
        expect(state.afterY).toBeUndefined();
        expect(state.piece).toBeUndefined();
      });
    });

    describe('togglePause', () => {
      test('should toggle pause state', () => {
        expect(state.pause).toBe(false);
        
        mutations.togglePause(state);
        expect(state.pause).toBe(true);
        
        mutations.togglePause(state);
        expect(state.pause).toBe(false);
      });
    });
  });

  describe('KIF notation helpers', () => {
    test('should correctly map coordinates to Japanese notation', () => {
      // Test conversion from board coordinates to KIF notation
      const testCases = [
        { x: 0, y: 0, expectedX: '９', expectedY: '一' }, // Top-right corner
        { x: 8, y: 8, expectedX: '１', expectedY: '九' }, // Bottom-left corner
        { x: 4, y: 4, expectedX: '５', expectedY: '五' }, // Center
      ];

      testCases.forEach(({ x, y, expectedX, expectedY }) => {
        const xChar = state.xChars[String(9 - x)];
        const yChar = state.yChars[String(y + 1)];
        
        expect(xChar).toBe(expectedX);
        expect(yChar).toBe(expectedY);
      });
    });

    test('should handle promoted piece notation', () => {
      const promotedPieces = ['+S', '+N', '+L', '+R', '+B', '+P'];
      
      promotedPieces.forEach(piece => {
        expect(state.komaChars[piece]).toBeDefined();
        expect(state.komaChars[piece]).not.toBe(state.komaChars[piece.charAt(1)]);
      });
    });
  });
});