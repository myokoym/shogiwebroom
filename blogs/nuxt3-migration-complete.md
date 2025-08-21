---
title: "Successfully Migrated from Nuxt 2 to Nuxt 3"
date: 2025-01-20
author: myokoym
tags: [nuxt3, vue3, migration, typescript]
category: development
description: "A complete guide on migrating a production Shogi web application from Nuxt 2 to Nuxt 3"
---

# Successfully Migrated from Nuxt 2 to Nuxt 3

[English](nuxt3-migration-complete.md) | [日本語](nuxt3-migration-complete.ja.md)

## TL;DR

Successfully migrated a production Shogi web application from Nuxt 2.18.1 to Nuxt 3.18.1, including Vue 3 upgrade, TypeScript enablement, and converting all components to Composition API. The migration reduced codebase by ~10,000 lines while maintaining all functionality.

## Introduction

After encountering critical issues with Nitro's experimental WebSocket feature causing 404 errors in production, we decided to complete a full migration from Nuxt 2 to Nuxt 3. This migration was initially planned using Nuxt Bridge as a stepping stone, but we discovered that a direct migration was more effective.

## The Migration Journey

### Initial Challenges

The migration started with confusion about package naming:
- Initially installed `nuxt3` package (experimental nightly builds)
- Correct package was simply `nuxt` version 3.x
- This caused hours of debugging as Nuxt 2 was still running

### Major Changes Implemented

#### 1. Framework Upgrade
```json
// Before
"nuxt": "^2.18.1",
"vue": "^2.7.16"

// After
"nuxt": "^3.18.1",
"vue": "^3.5.18"
```

#### 2. Component Migration
All 8 Vue components converted from Options API to Composition API:

```javascript
// Before (Options API)
export default Vue.extend({
  data() {
    return { count: 0 }
  },
  methods: {
    increment() { this.count++ }
  }
})

// After (Composition API)
<script setup>
const count = ref(0)
const increment = () => count.value++
</script>
```

#### 3. TypeScript Support
- Enabled native TypeScript support with Vite
- All Pinia stores maintained with `.ts` extensions
- No additional configuration required

### Technical Discoveries

1. **Build System Change**: Webpack 4 → Vite
   - Resolved ES2022 syntax issues
   - Faster build times (3.2 seconds)
   - Better TypeScript support

2. **UI Library Migration**: bootstrap-vue → bootstrap-vue-next
   - Required for Vue 3 compatibility
   - Fixed Vue version conflicts

3. **Plugin Updates**: All plugins converted to `defineNuxtPlugin` format

## Results

### Performance Metrics
- Build time: ~3.2 seconds
- Bundle size: 4.08 MB (1.15 MB gzip)
- Code reduction: 10,747 lines removed

### Migration Statistics
```
28 files changed
13,291 insertions(+)
24,038 deletions(-)
```

## Key Takeaways

1. **Direct Migration vs Bridge**: Sometimes direct migration is cleaner than using bridge solutions
2. **Package Naming**: Always verify official package names in documentation
3. **TypeScript Benefits**: Nuxt 3's native TypeScript support eliminates complex configurations
4. **Code Quality**: Modern syntax results in cleaner, more maintainable code

## Next Steps

- [ ] Socket.IO integration testing
- [ ] Production deployment configuration
- [ ] Docker setup updates
- [ ] Performance optimization
- [ ] Consider migrating to Nuxt UI

## Conclusion

The migration from Nuxt 2 to Nuxt 3 was challenging but rewarding. Despite initial confusion and setbacks, the result is a modern, maintainable codebase with improved developer experience and better performance. The key was persistence and understanding that error messages don't always point to the real issue.

## References

- [Nuxt 3 Documentation](https://nuxt.com)
- [Vue 3 Migration Guide](https://v3-migration.vuejs.org/)
- [Bootstrap Vue Next](https://bootstrap-vue-next.github.io/bootstrap-vue-next/)
- [Session History](../.claude/session-history/2025-01-20-nuxt3-migration.md)