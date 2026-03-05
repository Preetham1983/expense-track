import asyncio
import os
import sys
from datetime import datetime

# Add backend to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Mock base repository to avoid DB connection for a quick unit test check
# In a real scenario, we'd use a test DB.

async def verify_duplicate_check():
    print("Verifying duplicate notification check logic...")
    
    # This is a conceptual check since we don't have a test DB set up here
    # If the repository exists_by_metadata works, the service logic will work.
    
    from notifications.spending_observer import SpendingObserver
    from repositories.notification_repository import NotificationRepository
    
    # Mocking the repository count method
    original_count = NotificationRepository.count
    
    async def mock_count(query):
        print(f"Checking for existing notification with query: {query}")
        # Simulate that a notification exists for this month
        if query.get("type") == "emi_reminder" and "created_at" in query:
             return 1
        return 0
        
    NotificationRepository.count = mock_count
    
    exists = await NotificationRepository.exists_by_metadata({
        "user_id": "test_user",
        "type": "emi_reminder",
        "title": "EMI Due: Car",
        "created_at": {"$gte": datetime.utcnow().replace(day=1)}
    })
    
    print(f"Exists: {exists}")
    assert exists == True
    
    NotificationRepository.count = original_count
    print("Verification successful!")

if __name__ == "__main__":
    asyncio.run(verify_duplicate_check())
