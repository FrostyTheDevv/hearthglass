#!/usr/bin/env node
import crypto from 'node:crypto';
import { HearthglassDatabase } from './db.mjs';

/**
 * First-Administrator Provisioning CLI for Hearthglass.
 * 
 * Requirements:
 * - Explicit operator execution via CLI.
 * - Secure configuration.
 * - Strong unique credentials.
 * - A zero-administrator prerequisite (cannot be used if an administrator already exists).
 * - Comprehensive audit record in role_change_audit.
 * - No silent role changes.
 */
export async function provisionFirstAdministratorCli(options = {}) {
  const {
    email = process.env.ADMIN_EMAIL,
    username = process.env.ADMIN_USERNAME,
    password = process.env.ADMIN_PASSWORD,
    reason = 'Initial administrator provisioning via operator CLI',
    dataDir = null,
    databaseUrl = process.env.DATABASE_URL
  } = options;

  if (!email || !username || !password) {
    throw new Error(
      'Missing required parameters: email, username, and password must be provided via arguments or environment variables (ADMIN_EMAIL, ADMIN_USERNAME, ADMIN_PASSWORD).'
    );
  }

  const db = new HearthglassDatabase({ dataDir, databaseUrl });
  await db.init();

  try {
    // 1. Zero-administrator prerequisite check
    const adminCount = await db.getAdministratorCount();
    if (adminCount > 0) {
      throw new Error(
        `Zero-administrator prerequisite failed: ${adminCount} administrator(s) already exist. Additional administrators must be promoted by an authenticated administrator session.`
      );
    }

    // 2. Validate password complexity and credential formatting
    db.validateAdminCredentials(email, username, password);

    // 3. Atomically create or promote administrator inside transaction
    const result = await db.withTransaction(async (tx) => {
      // Re-check admin count under lock if possible
      const recheck = await tx("SELECT COUNT(*)::int as count FROM users WHERE role = 'administrator'");
      if (Number(recheck.rows[0]?.count || 0) > 0) {
        throw new Error('Zero-administrator prerequisite violated: an administrator was provisioned concurrently.');
      }

      const existingUser = await tx(
        'SELECT id, role FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2) LIMIT 1',
        [email, username]
      );

      let targetUserId;
      let oldRole = 'none';

      if (existingUser.rows.length > 0) {
        targetUserId = existingUser.rows[0].id;
        oldRole = existingUser.rows[0].role || 'player';
        await tx("UPDATE users SET role = 'administrator' WHERE id = $1", [targetUserId]);
      } else {
        // Create user with explicit administrator role
        targetUserId = crypto.randomUUID();
        const pwdHash = (await import('./db.mjs')).hashPassword(password);
        await tx(
          "INSERT INTO users (id, email, username, status, role) VALUES ($1, $2, $3, 'active', 'administrator')",
          [targetUserId, email, username]
        );
        await tx(
          "INSERT INTO authentication_identities (id, user_id, provider, password_hash, last_login_at) VALUES ($1, $2, 'password', $3, NOW())",
          [crypto.randomUUID(), targetUserId, pwdHash]
        );
        await tx('INSERT INTO account_settings (user_id) VALUES ($1)', [targetUserId]);
        await tx('INSERT INTO player_profiles (user_id) VALUES ($1)', [targetUserId]);
        await tx(
          "INSERT INTO player_characters (id, user_id, character_name, appearance_json, current_region, current_district) VALUES ($1, $2, $3, $4::jsonb, 'lumenport', 'lumenport_arrival_square')",
          [
            crypto.randomUUID(),
            targetUserId,
            username,
            JSON.stringify({ body_type: 'adventurer_a', hair_style: 'windswept_short', outfit: 'lumenport_coat_gold' })
          ]
        );
        await tx('INSERT INTO wallet_balances (user_id, crowns, echo_dust, sigils) VALUES ($1, 1000, 500, 5)', [targetUserId]);
        await tx("INSERT INTO player_world_progress (user_id, story_chapter, in_game_minutes, current_weather) VALUES ($1, 1, 600, 'clear')", [targetUserId]);
        await tx("INSERT INTO player_housing (user_id, room_theme, layout_json) VALUES ($1, 'lumenport_harbor_loft', '[]'::jsonb)", [targetUserId]);
        await tx("INSERT INTO discovered_locations (user_id, location_id, fast_travel_unlocked) VALUES ($1, 'lumenport_arrival_square', TRUE) ON CONFLICT DO NOTHING", [targetUserId]);
      }

      // 4. Record explicit operator audit trail
      const auditId = crypto.randomUUID();
      await tx(
        `INSERT INTO role_change_audit (id, target_user_id, changed_by, old_role, new_role, reason, created_at)
         VALUES ($1, $2, NULL, $3, 'administrator', $4, NOW())`,
        [auditId, targetUserId, oldRole, reason]
      );

      return {
        user_id: targetUserId,
        email,
        username,
        role: 'administrator',
        audit_id: auditId
      };
    });

    return result;
  } finally {
    await db.close();
  }
}

// Standalone CLI invocation
if (process.argv[1] && process.argv[1].endsWith('cli.mjs')) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'provision-admin') {
    let email = null;
    let username = null;
    let password = null;

    for (let i = 1; i < args.length; i++) {
      if (args[i] === '--email' && args[i + 1]) email = args[++i];
      else if (args[i] === '--username' && args[i + 1]) username = args[++i];
      else if (args[i] === '--password' && args[i + 1]) password = args[++i];
    }

    provisionFirstAdministratorCli({ email, username, password })
      .then((res) => {
        console.log('Successfully provisioned first administrator:');
        console.log(`  User ID:  ${res.user_id}`);
        console.log(`  Username: ${res.username}`);
        console.log(`  Email:    ${res.email}`);
        console.log(`  Audit ID: ${res.audit_id}`);
        process.exit(0);
      })
      .catch((err) => {
        console.error(`Provisioning Error: ${err.message}`);
        process.exit(1);
      });
  } else {
    console.log('Usage:');
    console.log('  node services/api/src/cli.mjs provision-admin --email <email> --username <username> --password <password>');
    process.exit(1);
  }
}
