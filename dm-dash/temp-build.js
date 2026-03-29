import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('Build succeeded');
} catch (e) {
  writeFileSync('build-error.txt', e.stderr.toString() + "\nSTDOUT:\n" + e.stdout.toString());
  console.log('Wrote error to build-error.txt');
}
