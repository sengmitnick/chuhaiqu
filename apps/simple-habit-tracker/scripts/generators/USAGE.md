# Generator Usage

Non-interactive code generators for Expo, inspired by Rails generators.

## Quick Start

```bash
npm run gen authentication
```

## Available Generators

### api
Generate frontend API client with TypeScript types and service methods

**Usage:**
```bash
npm run gen api RESOURCE [actions...]
npm run gen api posts                    # Generate all CRUD actions
npm run gen api posts index show create  # Generate specific actions
```

**Generates:**
- `types/RESOURCE.ts` - TypeScript type definitions
- `services/RESOURCE.ts` - API service class with methods

**Next steps:**
1. Edit `types/RESOURCE.ts` to add your model fields
2. Generate backend: `cd backend && rails g controller api::v1::RESOURCE [actions...]`
3. Import and use the service in your components:
   ```ts
   import { postsService } from '../services/posts';
   const posts = await postsService.getAll();
   ```

### authentication
Generate complete authentication system (login, signup, password reset)

**Usage:**
```bash
npm run gen authentication
```

**Generates:**
- Authentication types, services, context
- Login/Sign-up/Forgot password screens
- useAuth hook

**Next steps:**
1. Set `EXPO_PUBLIC_API_URL` in `.env`
2. Wrap app with `<AuthProvider>` in `app/_layout.tsx`
3. Use `useAuth()` in components

## Creating New Generators

```javascript
// scripts/generators/my-generator.js
const { say, copyFile, showSummary } = require('./generator-utils');

async function generate(name, options) {
  say('🚀 Generating...', 'green');

  copyFile('my.ts.template', `output/${name}.ts`, {}, 'my-generator');

  showSummary({
    title: 'Done!',
    nextSteps: ['Step 1', 'Step 2']
  });
}

module.exports = generate;
```

Then register in `index.js` and add templates to `scripts/templates/my-generator/`

## Generator Utils

```javascript
// File operations
createFile(path, content, options)
copyFile(source, dest, options, generatorName)
template(source, dest, variables, options, generatorName)
removeFile(path)

// File manipulation
injectIntoFile(path, content, { after, before })
appendToFile(path, content)
gsubFile(path, pattern, replacement)

// Output & tracking
say(message, color)
showSummary({ title, nextSteps })
```

See `generator-utils.js` for full API.
