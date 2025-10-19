-- ===================================================================
-- Migration: Enhanced Marketplace Request Queue System
-- Description: Adds support for multiple buyers requesting the same book
--              with queue management and transaction completion tracking
-- ===================================================================

-- Step 1: Create book_requests table to track all buyers interested in a book
CREATE TABLE IF NOT EXISTS book_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  marketplace_book_id INT NOT NULL,
  requester_id INT NOT NULL,
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
  is_priority_buyer BOOLEAN DEFAULT FALSE COMMENT 'TRUE if this is the current active/first buyer in queue',
  cancelled_at DATETIME NULL,
  completed_at DATETIME NULL,

  FOREIGN KEY (marketplace_book_id) REFERENCES used_books_marketplace(id) ON DELETE CASCADE,
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_marketplace_book (marketplace_book_id),
  INDEX idx_requester (requester_id),
  INDEX idx_status (status),
  INDEX idx_priority (is_priority_buyer),
  INDEX idx_requested_at (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Modify used_books_marketplace table for enhanced status tracking
ALTER TABLE used_books_marketplace
  MODIFY COLUMN status ENUM('available', 'requested', 'sold', 'completed') DEFAULT 'available',
  ADD COLUMN active_requester_id INT NULL COMMENT 'Current priority buyer (first in queue)',
  ADD COLUMN sold_at DATETIME NULL COMMENT 'When seller marked as sold',
  ADD COLUMN completed_at DATETIME NULL COMMENT 'When transaction fully completed (both sold and received)',
  ADD COLUMN total_requests INT DEFAULT 0 COMMENT 'Count of active requests',
  ADD CONSTRAINT fk_active_requester FOREIGN KEY (active_requester_id) REFERENCES users(id) ON DELETE SET NULL;

-- Step 3: Add index for performance
ALTER TABLE used_books_marketplace
  ADD INDEX idx_active_requester (active_requester_id),
  ADD INDEX idx_status_enhanced (status);

-- Step 4: Migrate existing data from selling_books to book_requests
-- This captures any ongoing transactions
INSERT INTO book_requests (marketplace_book_id, requester_id, requested_at, status, is_priority_buyer)
SELECT
  m.id,
  m.buyer_id,
  m.requested_at,
  CASE
    WHEN m.status = 'requested' THEN 'active'
    WHEN m.status = 'received' THEN 'completed'
    ELSE 'active'
  END,
  TRUE -- They are the priority buyer since they're the only one
FROM used_books_marketplace m
WHERE m.buyer_id IS NOT NULL AND m.requested_at IS NOT NULL;

-- Step 5: Update used_books_marketplace with active_requester_id
UPDATE used_books_marketplace m
SET active_requester_id = buyer_id,
    total_requests = 1
WHERE buyer_id IS NOT NULL;

-- Step 6: Create trigger to maintain total_requests count
DELIMITER $$

CREATE TRIGGER update_request_count_insert
AFTER INSERT ON book_requests
FOR EACH ROW
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE used_books_marketplace
    SET total_requests = total_requests + 1
    WHERE id = NEW.marketplace_book_id;
  END IF;
END$$

CREATE TRIGGER update_request_count_update
AFTER UPDATE ON book_requests
FOR EACH ROW
BEGIN
  -- If status changed from active to something else, decrement
  IF OLD.status = 'active' AND NEW.status != 'active' THEN
    UPDATE used_books_marketplace
    SET total_requests = GREATEST(0, total_requests - 1)
    WHERE id = NEW.marketplace_book_id;
  END IF;

  -- If status changed from non-active to active, increment
  IF OLD.status != 'active' AND NEW.status = 'active' THEN
    UPDATE used_books_marketplace
    SET total_requests = total_requests + 1
    WHERE id = NEW.marketplace_book_id;
  END IF;
END$$

CREATE TRIGGER update_request_count_delete
AFTER DELETE ON book_requests
FOR EACH ROW
BEGIN
  IF OLD.status = 'active' THEN
    UPDATE used_books_marketplace
    SET total_requests = GREATEST(0, total_requests - 1)
    WHERE id = OLD.marketplace_book_id;
  END IF;
END$$

DELIMITER ;

-- Step 7: Create stored procedure to promote next buyer in queue
DELIMITER $$

CREATE PROCEDURE promote_next_buyer(IN p_marketplace_book_id INT)
BEGIN
  DECLARE v_next_requester_id INT;

  -- Find the next active requester (ordered by requested_at)
  SELECT requester_id INTO v_next_requester_id
  FROM book_requests
  WHERE marketplace_book_id = p_marketplace_book_id
    AND status = 'active'
    AND is_priority_buyer = FALSE
  ORDER BY requested_at ASC
  LIMIT 1;

  IF v_next_requester_id IS NOT NULL THEN
    -- Clear current priority buyer
    UPDATE book_requests
    SET is_priority_buyer = FALSE
    WHERE marketplace_book_id = p_marketplace_book_id
      AND is_priority_buyer = TRUE;

    -- Set new priority buyer
    UPDATE book_requests
    SET is_priority_buyer = TRUE
    WHERE marketplace_book_id = p_marketplace_book_id
      AND requester_id = v_next_requester_id
      AND status = 'active';

    -- Update marketplace table
    UPDATE used_books_marketplace
    SET active_requester_id = v_next_requester_id,
        buyer_id = v_next_requester_id
    WHERE id = p_marketplace_book_id;
  ELSE
    -- No more requesters, set back to available
    UPDATE used_books_marketplace
    SET status = 'available',
        active_requester_id = NULL,
        buyer_id = NULL,
        requested_at = NULL
    WHERE id = p_marketplace_book_id;
  END IF;
END$$

DELIMITER ;

-- Step 8: Add comments for documentation
ALTER TABLE book_requests
  COMMENT = 'Tracks all buyer requests for marketplace books with queue management';

ALTER TABLE used_books_marketplace
  MODIFY COLUMN requested_at DATETIME NULL COMMENT 'When first request was made (priority buyer timestamp)';

-- ===================================================================
-- Migration Complete
-- ===================================================================
-- Summary:
-- - Created book_requests table for queue management
-- - Enhanced used_books_marketplace with new status and tracking fields
-- - Added triggers to maintain request counts automatically
-- - Added stored procedure for queue promotion logic
-- - Migrated existing data
-- ===================================================================
