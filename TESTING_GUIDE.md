# Testing the Review Workflow

## 🧪 How to Test the Complete Review System

### Step 1: Submit a Test Review
1. Go to `/reviews` page
2. Scroll to "Write a Review" section at the bottom
3. Fill out the form with test data:
   - Name: "John Test"
   - Email: "john@test.com"
   - Company: "Test Company"
   - Rating: 5 stars
   - Title: "Amazing service!"
   - Content: "This is a test review to verify the workflow works correctly."
4. Click "Submit Review"
5. You should see a success message

### Step 2: Verify Review is Pending
1. Go to `/reviews` page
2. **You should NOT see your test review** (because it's pending approval)
3. Note that the page shows "No Reviews Yet" or only previously approved reviews

### Step 3: Access Admin Interface
1. Go to `/admin` (from navigation or directly)
2. Click "Manage Reviews" button
3. You should see your test review in the "Pending" tab

### Step 4: Approve the Review
1. In admin interface, find your test review
2. Click the green "Approve" button
3. You should see success message: "Review approved! It will now appear on the public reviews page."
4. Review should move to "Approved" tab

### Step 5: Verify Public Display
1. Go back to `/reviews` page
2. **You should now see your test review** in the "All Reviews" section
3. It should display with all the details you entered

### Step 6: Test Featured Functionality
1. Go back to `/admin/reviews`
2. Find your approved review
3. Click the "Feature" button (eye icon)
4. You should see success message: "Review marked as featured! It will appear in the featured section."

### Step 7: Verify Featured Display
1. Go back to `/reviews` page
2. **You should now see your review twice:**
   - Once in the "Featured Reviews" section at the top
   - Once in the "More Reviews" section below (note the title changed from "All Reviews")

### Step 8: Test Unfeature
1. Go back to admin and click "Unfeature" (eye-off icon)
2. Review should only appear in the "All Reviews" section (title changes back)

### Step 9: Test Rejection
1. In admin, click "Reject" on a review
2. Go to public page - review should disappear
3. In admin, review appears in "Rejected" tab

## ✅ Expected Behavior Summary

| Review Status | Public Page Display | Admin Tab |
|---------------|-------------------|-----------|
| Pending | ❌ Not visible | Pending |
| Approved | ✅ Visible in "All Reviews" | Approved |
| Approved + Featured | ✅ Visible in both "Featured" and "More Reviews" | Approved |
| Rejected | ❌ Not visible | Rejected |

## 🔧 Troubleshooting

If reviews don't appear:
1. Check browser console for errors
2. Verify MongoDB connection in terminal
3. Check if environment variables are set correctly
4. Try refreshing the page (cached data)

If admin interface doesn't work:
1. Check browser console for API errors
2. Verify admin API endpoints are accessible
3. Check database connection
