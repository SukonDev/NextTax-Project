import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function replaceInDir(dir) {
    const files = readdirSync(dir);
    for (const file of files) {
        const fullPath = join(dir, file);
        if (statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist' && file !== 'out' && file !== '.git') {
                replaceInDir(fullPath);
            }
        } else if (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.css')) {
            const content = readFileSync(fullPath, 'utf8');
            if (content.includes('electronAPI')) {
                console.log(`Updating ${fullPath}`);
                const updatedContent = content.replace(/electronAPI/g, 'nextTaxAPI');
                writeFileSync(fullPath, updatedContent, 'utf8');
            }
        }
    }
}

replaceInDir('src');
console.log('API Rename Complete');
