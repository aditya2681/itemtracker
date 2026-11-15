import tseslint from 'typescript-eslint';
export default tseslint.config({ ignores: ['node_modules/**', 'dist/**', '.agents/**', '.claude/**', 'agent/**', 'convex/_generated/**'] }, ...tseslint.configs.recommended);
