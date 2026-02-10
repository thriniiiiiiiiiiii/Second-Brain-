/**
 * Second Brain Health Check Script
 * Run this to verify all systems are working
 * 
 * Usage: npx tsx health-check.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function logSuccess(message: string) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message: string) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message: string) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logInfo(message: string) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

async function checkDatabase() {
  console.log('\n🗄️  DATABASE CHECK\n' + '='.repeat(50));

  try {
    // Test connection
    await prisma.$connect();
    logSuccess('Database connection successful');

    // Check tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    ` as any[];

    const expectedTables = ['Knowledge'];
    const foundTables = tables.map((t: any) => t.table_name);

    for (const table of expectedTables) {
      if (foundTables.includes(table)) {
        logSuccess(`Table "${table}" exists`);
      } else {
        logError(`Table "${table}" missing - run "npx prisma migrate dev"`);
      }
    }

    // Count records
    const itemCount = await prisma.knowledge.count();

    logInfo(`Knowledge items: ${itemCount}`);

    return true;
  } catch (error) {
    logError(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

async function checkAPIRoutes() {
  console.log('\n🔌 API ROUTES CHECK\n' + '='.repeat(50));

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const routes = [
    { path: '/api/knowledge', method: 'GET' },
    { path: '/api/public/brain/query?q=test', method: 'GET' },
  ];

  let allPassed = true;

  for (const route of routes) {
    try {
      const response = await fetch(`${baseUrl}${route.path}`, {
        method: route.method,
      });

      if (response.ok) {
        logSuccess(`${route.method} ${route.path} → ${response.status}`);
      } else {
        logWarning(`${route.method} ${route.path} → ${response.status} (may need data)`);
      }
    } catch (error) {
      logError(`${route.method} ${route.path} → Failed to connect`);
      logInfo('Make sure "npm run dev" is running!');
      allPassed = false;
    }
  }

  return allPassed;
}

async function checkClaudeAPI() {
  console.log('\n🤖 CLAUDE AI CHECK\n' + '='.repeat(50));

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    logError('ANTHROPIC_API_KEY not found in environment');
    logInfo('Add it to your .env file');
    return false;
  }

  if (!apiKey.startsWith('sk-ant-')) {
    logWarning('API key format looks incorrect (should start with sk-ant-)');
  }

  logSuccess('ANTHROPIC_API_KEY found');

  try {
    // Test actual API call
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    });

    if (response.ok) {
      logSuccess('Claude API is responding correctly');
      return true;
    } else {
      const error = await response.json();
      logError(`Claude API error: ${error.error?.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logError(`Failed to connect to Claude API: ${error instanceof Error ? error.message : 'Unknown'}`);
    return false;
  }
}

async function checkEnvironment() {
  console.log('\n🔐 ENVIRONMENT VARIABLES CHECK\n' + '='.repeat(50));

  const required = [
    'DATABASE_URL',
    'ANTHROPIC_API_KEY',
  ];

  const optional = [
    'NEXT_PUBLIC_APP_URL',
  ];

  let allPresent = true;

  for (const key of required) {
    if (process.env[key]) {
      logSuccess(`${key} is set`);
    } else {
      logError(`${key} is missing`);
      allPresent = false;
    }
  }

  for (const key of optional) {
    if (process.env[key]) {
      logInfo(`${key} is set (optional)`);
    } else {
      logWarning(`${key} not set (will use default)`);
    }
  }

  return allPresent;
}

async function createTestData() {
  console.log('\n📝 TEST DATA CHECK\n' + '='.repeat(50));

  try {
    const count = await prisma.knowledge.count();

    if (count === 0) {
      logWarning('No knowledge items found - creating test data...');

      await prisma.knowledge.create({
        data: {
          title: 'Health Check Test',
          content: 'This is a test knowledge item created by the health check script.',
          type: 'note',
          tags: ['test', 'health-check'],
          summary: 'A test item for verification purposes.',
          embedding: [],
        },
      });

      logSuccess('Test knowledge item created');
    } else {
      logInfo(`Found ${count} existing knowledge items`);
    }

    return true;
  } catch (error) {
    logError(`Failed to create test data: ${error instanceof Error ? error.message : 'Unknown'}`);
    return false;
  }
}

async function runHealthCheck() {
  console.log('\n' + '='.repeat(50));
  console.log('🏥 SECOND BRAIN HEALTH CHECK');
  console.log('='.repeat(50));

  const results = {
    environment: await checkEnvironment(),
    database: await checkDatabase(),
    testData: await createTestData(),
    claudeAPI: await checkClaudeAPI(),
    apiRoutes: await checkAPIRoutes(),
  };

  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));

  const allPassed = Object.values(results).every(r => r);

  for (const [check, passed] of Object.entries(results)) {
    const status = passed ? `${colors.green}✅ PASS` : `${colors.red}❌ FAIL`;
    console.log(`${status} ${colors.blue}${check}${colors.reset}`);
  }

  console.log('\n' + '='.repeat(50));

  if (allPassed) {
    logSuccess('All systems operational! 🚀');
    logInfo('\nNext steps:');
    logInfo('1. Visit http://localhost:3000 to see the landing page');
    logInfo('2. Go to http://localhost:3000/dashboard to start using the app');
    logInfo('3. Try creating a knowledge item and testing AI features');
  } else {
    logWarning('Some checks failed - review errors above');
    logInfo('\nCommon fixes:');
    logInfo('• Run "npx prisma migrate dev" if tables are missing');
    logInfo('• Check .env file has DATABASE_URL and ANTHROPIC_API_KEY');
    logInfo('• Make sure "npm run dev" is running for API route tests');
  }

  await prisma.$disconnect();
  process.exit(allPassed ? 0 : 1);
}

// Run the health check
runHealthCheck().catch(console.error);