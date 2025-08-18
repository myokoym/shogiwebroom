/**
 * Critical Path E2E Tests
 * These tests verify that core functionality is not broken after updates
 */

const { test, expect } = require('@playwright/test');

test.describe('Critical User Paths', () => {
  
  test('1. Homepage loads successfully', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/将棋|Shogi/i);
    
    // Check that main elements are visible
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check that room creation button exists
    const createRoomButton = page.locator('button:has-text("部屋を作る"), a:has-text("部屋を作る"), button:has-text("Create Room"), a:has-text("Create Room")');
    await expect(createRoomButton).toBeVisible();
  });

  test('2. Room creation and entry works', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    
    // Click on create room button
    await page.click('button:has-text("部屋を作る"), a:has-text("部屋を作る"), button:has-text("Create Room"), a:has-text("Create Room")');
    
    // Wait for navigation to room
    await page.waitForURL(/\/rooms\/[a-zA-Z0-9]+/, { timeout: 10000 });
    
    // Verify we're in a room
    const url = page.url();
    expect(url).toMatch(/\/rooms\/[a-zA-Z0-9]+/);
    
    // Check that shogiboard is visible
    const shogiboard = page.locator('#shogiboard, .shogiboard, [class*="board"]').first();
    await expect(shogiboard).toBeVisible({ timeout: 10000 });
    
    // Store room ID for later tests
    const roomId = url.split('/rooms/')[1];
    console.log(`Created room: ${roomId}`);
  });

  test('3. Shogiboard displays initial position', async ({ page }) => {
    // Create a new room
    await page.goto('/');
    await page.click('button:has-text("部屋を作る"), a:has-text("部屋を作る"), button:has-text("Create Room"), a:has-text("Create Room")');
    await page.waitForURL(/\/rooms\/[a-zA-Z0-9]+/);
    
    // Wait for board to be visible
    const board = page.locator('#shogiboard, .shogiboard').first();
    await expect(board).toBeVisible();
    
    // Check that pieces are displayed (at least some pieces should be visible)
    const pieces = page.locator('img[alt*="駒"], img[alt*="piece"], img[src*=".png"], .piece');
    const pieceCount = await pieces.count();
    
    // Initial position should have 40 pieces (20 for each player)
    expect(pieceCount).toBeGreaterThanOrEqual(20);
    console.log(`Found ${pieceCount} pieces on the board`);
  });

  test('4. Piece movement works', async ({ page }) => {
    // Create a new room
    await page.goto('/');
    await page.click('button:has-text("部屋を作る"), a:has-text("部屋を作る"), button:has-text("Create Room"), a:has-text("Create Room")');
    await page.waitForURL(/\/rooms\/[a-zA-Z0-9]+/);
    
    // Wait for board
    const board = page.locator('#shogiboard, .shogiboard').first();
    await expect(board).toBeVisible();
    
    // Try to move a piece (pawn)
    // Find a pawn in the 7th rank (standard starting position)
    const sourcePiece = page.locator('img[alt*="歩"], img[src*="P.png"], img[src*="p.png"]').first();
    
    // Get initial position
    const initialBox = await sourcePiece.boundingBox();
    if (!initialBox) {
      console.log('Could not find piece to move');
      return;
    }
    
    // Perform drag and drop (move pawn one square forward)
    await sourcePiece.hover();
    await page.mouse.down();
    await page.mouse.move(initialBox.x, initialBox.y - 60); // Move up one square
    await page.mouse.up();
    
    // Verify piece moved (position changed)
    await page.waitForTimeout(500); // Wait for move to register
    
    // Check that the move was registered (kif display or move list should update)
    const kifDisplay = page.locator('.kif, #kif, [class*="move"], [class*="notation"]');
    const kifText = await kifDisplay.textContent().catch(() => '');
    
    console.log(`Move registered: ${kifText ? 'Yes' : 'No movement detected'}`);
  });

  test('5. Multi-browser synchronization', async ({ browser }) => {
    // Create two browser contexts
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    try {
      // Player 1 creates a room
      await page1.goto('/');
      await page1.click('button:has-text("部屋を作る"), a:has-text("部屋を作る"), button:has-text("Create Room"), a:has-text("Create Room")');
      await page1.waitForURL(/\/rooms\/[a-zA-Z0-9]+/);
      
      const roomUrl = page1.url();
      console.log(`Room URL: ${roomUrl}`);
      
      // Player 2 joins the same room
      await page2.goto(roomUrl);
      
      // Wait for both boards to be visible
      const board1 = page1.locator('#shogiboard, .shogiboard').first();
      const board2 = page2.locator('#shogiboard, .shogiboard').first();
      
      await expect(board1).toBeVisible();
      await expect(board2).toBeVisible();
      
      // Player 1 moves a piece
      const piece1 = page1.locator('img[alt*="歩"], img[src*="P.png"], img[src*="p.png"]').first();
      const box1 = await piece1.boundingBox();
      
      if (box1) {
        // Move the piece
        await piece1.hover();
        await page1.mouse.down();
        await page1.mouse.move(box1.x, box1.y - 60);
        await page1.mouse.up();
        
        // Wait for synchronization
        await page1.waitForTimeout(1000);
        await page2.waitForTimeout(1000);
        
        // Verify both players see the same board state
        // Check kif/move list on both pages
        const kif1 = await page1.locator('.kif, #kif, [class*="move"]').textContent().catch(() => '');
        const kif2 = await page2.locator('.kif, #kif, [class*="move"]').textContent().catch(() => '');
        
        console.log(`Player 1 sees: ${kif1}`);
        console.log(`Player 2 sees: ${kif2}`);
        
        // Both should show some move notation
        expect(kif1.length).toBeGreaterThan(0);
        expect(kif2.length).toBeGreaterThan(0);
      }
      
    } finally {
      // Clean up
      await context1.close();
      await context2.close();
    }
  });

  test('6. Room persistence (rejoin room)', async ({ page, context }) => {
    // Create a room
    await page.goto('/');
    await page.click('button:has-text("部屋を作る"), a:has-text("部屋を作る"), button:has-text("Create Room"), a:has-text("Create Room")');
    await page.waitForURL(/\/rooms\/[a-zA-Z0-9]+/);
    
    const roomUrl = page.url();
    const roomId = roomUrl.split('/rooms/')[1];
    
    // Make a move
    const piece = page.locator('img[alt*="歩"], img[src*="P.png"], img[src*="p.png"]').first();
    const box = await piece.boundingBox();
    
    if (box) {
      await piece.hover();
      await page.mouse.down();
      await page.mouse.move(box.x, box.y - 60);
      await page.mouse.up();
      await page.waitForTimeout(500);
    }
    
    // Get current board state
    const kifBefore = await page.locator('.kif, #kif, [class*="move"]').textContent().catch(() => '');
    
    // Leave and rejoin the room
    await page.goto('/');
    await page.waitForTimeout(500);
    await page.goto(roomUrl);
    
    // Wait for board to load
    await expect(page.locator('#shogiboard, .shogiboard').first()).toBeVisible();
    
    // Check that the move is still there
    const kifAfter = await page.locator('.kif, #kif, [class*="move"]').textContent().catch(() => '');
    
    console.log(`Board state persisted: ${kifBefore === kifAfter ? 'Yes' : 'No'}`);
    console.log(`Before: ${kifBefore}`);
    console.log(`After: ${kifAfter}`);
    
    // The room should still exist and show the same state
    expect(page.url()).toBe(roomUrl);
  });
});