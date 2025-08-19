// Performance optimization configuration

export const bundleOptimization = {
  // Code splitting strategy
  splitChunks: {
    layouts: true,
    pages: true,
    commons: true
  },
  
  // Dynamic imports for lazy loading
  dynamicImports: [
    'components/Chat.vue',
    'components/Kif.vue',
    'components/Usage.vue',
    'components/Option.vue'
  ],
  
  // Chunk optimization
  chunks: {
    // Vendor chunks
    vendor: {
      name: 'vendor',
      test: /[\\/]node_modules[\\/]/,
      priority: 10
    },
    // Common chunks
    common: {
      name: 'common',
      minChunks: 2,
      priority: 5,
      reuseExistingChunk: true
    },
    // Socket.IO chunk
    socket: {
      name: 'socket',
      test: /[\\/]node_modules[\\/](socket\.io|engine\.io)/,
      priority: 20
    }
  }
}

export const imageOptimization = {
  // @nuxt/image module configuration
  formats: ['webp', 'avif', 'jpeg'],
  
  // Responsive image sizes
  screens: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536
  },
  
  // Image providers
  providers: {
    static: {
      baseURL: '/images'
    }
  },
  
  // Lazy loading settings
  lazyLoad: {
    offset: 50,
    threshold: 0.1
  }
}

export const ssrOptimization = {
  // Nitro prerendering
  prerender: {
    routes: [
      '/',
      '/api/health'
    ],
    ignore: [
      '/rooms/**'
    ]
  },
  
  // Static asset compression
  compressor: {
    gzip: true,
    brotli: true,
    threshold: 1024
  },
  
  // Cache headers
  headers: {
    static: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    },
    html: {
      'Cache-Control': 'public, max-age=0, must-revalidate'
    },
    api: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  },
  
  // Performance monitoring
  monitoring: {
    enabled: true,
    metrics: [
      'fcp', // First Contentful Paint
      'lcp', // Largest Contentful Paint
      'fid', // First Input Delay
      'cls', // Cumulative Layout Shift
      'ttfb' // Time to First Byte
    ]
  }
}

// Bundle size analysis
export const bundleAnalysis = {
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
  analyzerMode: 'static',
  reportFilename: 'bundle-report.html'
}

// Performance budgets
export const performanceBudgets = {
  maxEntrypointSize: 300000, // 300kb
  maxAssetSize: 100000, // 100kb
  hints: 'warning'
}