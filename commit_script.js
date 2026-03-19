const { spawnSync } = require('child_process');
const cwd = 'd:\\projects\\recipy sharing platform';

function git(...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf-8' });
  if (r.status !== 0 && r.stderr?.includes('fatal')) {
    console.error(`FAILED: git ${args.join(' ')}`);
    console.error(r.stderr.trim());
    process.exit(1);
  }
  return r;
}

// Commit 5: Auth pages + landing
git('add', '--', 'frontend/src/app/page.tsx');
git('add', '--', 'frontend/src/app/(auth)/login/page.tsx');
git('add', '--', 'frontend/src/app/(auth)/register/page.tsx');
git('commit', '-m', 'feat(frontend): add landing page, login, and registration pages', '--date=2026-03-16T10:30:00+05:30');
console.log('Commit 5 done');

// Commit 6: Recipe components
git('add', '--', 'frontend/src/components/RecipeCard.tsx', 'frontend/src/app/recipes');
git('commit', '-m', 'feat(frontend): add recipe feed, creation form, and detail view', '--date=2026-03-17T14:00:00+05:30');
console.log('Commit 6 done');

// Commit 7: Profile page
git('add', '--', 'frontend/src/app/profile');
git('commit', '-m', 'feat(frontend): add user profile page with recipe listings', '--date=2026-03-18T09:30:00+05:30');
console.log('Commit 7 done');

// Commit 8: Bug fixes
git('add', '--', 'backend/src/services/authService.ts', 'backend/src/config/index.ts');
git('commit', '-m', 'fix: resolve CORS, JWT token mapping, and dotenv path issues', '--date=2026-03-18T16:00:00+05:30');
console.log('Commit 8 done');

// Commit 9: Deployment prep (everything remaining except commit_script itself)
git('add', '.');
git('commit', '-m', 'chore: prepare for Railway deployment with Procfile and standalone build', '--date=2026-03-19T12:00:00+05:30');
console.log('Commit 9 done');

console.log('\nAll 9 commits created!');
