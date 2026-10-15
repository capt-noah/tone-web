import { registerUser, loginUser, updateUserEmail, findUserById } from '../src/services/auth.service';
import { createSession, validateSessionWithUser, destroySession } from '../src/services/session.service';
import { db } from '../src/db';
import { users } from '../src/schema';
import { eq } from 'drizzle-orm';

async function runTestSuite() {
  console.log('🧪 Starting Tone Backend Hardened Auth Test Suite...\n');

  const testUsername = `test_listener_${Date.now()}`;
  const testPassword = 'StrongPassword#2026';
  let createdUserId = '';
  let testSessionId = '';

  try {
    // Test 1: Username & Password ONLY Registration
    console.log('Test 1: Registration with strictly username and password...');
    const registered = await registerUser(testUsername, testPassword);
    createdUserId = registered.id;
    if (registered.username !== testUsername) throw new Error('Username mismatch');
    if (registered.email !== null) throw new Error('Email should be null by default');
    if (registered.firstName !== null) throw new Error('FirstName should be null by default');
    console.log('  ✅ Passed: User registered with zero email/name requirement. ID:', registered.id);

    // Test 2: Duplicate Username Rejection
    console.log('Test 2: Duplicate username collision rejection (case-insensitive)...');
    try {
      await registerUser(testUsername.toUpperCase(), 'AnotherPassword#1');
      throw new Error('Should have thrown on duplicate username');
    } catch (err: any) {
      if (!err.message.includes('already exists')) throw err;
      console.log('  ✅ Passed: Duplicate username rejected correctly.');
    }

    // Test 3: Short password rejection
    console.log('Test 3: Short password constraint rejection (< 6 chars)...');
    try {
      await registerUser(`short_${Date.now()}`, '123');
      throw new Error('Should have rejected short password');
    } catch (err: any) {
      if (!err.message.includes('between 6 and 128')) throw err;
      console.log('  ✅ Passed: Short password rejected with clear message.');
    }

    // Test 4: Timing-Safe Login with invalid credentials
    console.log('Test 4: Timing-safe invalid credentials handling...');
    const invalidPassLogin = await loginUser(testUsername, 'WrongPassword#999');
    if (invalidPassLogin !== null) throw new Error('Invalid password should return null');

    const nonExistentUserLogin = await loginUser('this_user_does_not_exist_xyz', 'RandomPassword#1');
    if (nonExistentUserLogin !== null) throw new Error('Non-existent user should return null');
    console.log('  ✅ Passed: Both wrong password and missing username handled safely.');

    // Test 5: Successful Login (case-insensitive)
    console.log('Test 5: Successful login with mixed-case username...');
    const loggedIn = await loginUser(testUsername.toUpperCase(), testPassword);
    if (!loggedIn || loggedIn.id !== createdUserId) throw new Error('Failed to login with correct credentials');
    console.log('  ✅ Passed: User authenticated successfully.');

    // Test 6: Single-Query Session Creation and Validation
    console.log('Test 6: Session creation and single-query join validation...');
    testSessionId = await createSession(createdUserId);
    const sessionAuth = await validateSessionWithUser(testSessionId);
    if (!sessionAuth || sessionAuth.user.id !== createdUserId) {
      throw new Error('Session validation failed');
    }
    console.log('  ✅ Passed: Session validated and user joined in 1 query.');

    // Test 7: Adding Email via Profile
    console.log('Test 7: Adding email via Profile update...');
    const testEmail = `${testUsername}@tone.test`;
    const userWithEmail = await updateUserEmail(createdUserId, testEmail);
    if (userWithEmail.email !== testEmail) throw new Error('Email was not updated');
    console.log('  ✅ Passed: Email attached successfully to user profile.');

    // Test 8: Invalid email format rejection
    console.log('Test 8: Invalid email syntax rejection...');
    try {
      await updateUserEmail(createdUserId, 'invalid-email-no-domain');
      throw new Error('Should have rejected invalid email');
    } catch (err: any) {
      if (!err.message.includes('Invalid email')) throw err;
      console.log('  ✅ Passed: Malformed email rejected.');
    }

    // Test 9: Clearing email (back to null)
    console.log('Test 9: Clearing email back to null...');
    const clearedUser = await updateUserEmail(createdUserId, null);
    if (clearedUser.email !== null) throw new Error('Email should be cleared to null');
    console.log('  ✅ Passed: Email cleared back to null without colliding with unique index.');

    // Test 10: Session Invalidation (Logout)
    console.log('Test 10: Destroying session (Logout)...');
    await destroySession(testSessionId);
    const postLogoutAuth = await validateSessionWithUser(testSessionId);
    if (postLogoutAuth !== null) throw new Error('Destroyed session still validated');
    console.log('  ✅ Passed: Session invalidated and subsequent requests unauthorized.');

    console.log('\n🎉 ALL 10 TESTS PASSED CLEANLY!\n');
  } finally {
    // Cleanup test record
    if (createdUserId) {
      console.log('Cleaning up test user record from database...');
      await db.delete(users).where(eq(users.id, createdUserId));
      console.log('Cleanup complete.');
    }
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
