/**
 * Vuex to Pinia Migration Helper
 * Provides compatibility layer for migrating from Vuex to Pinia
 */

/**
 * Convert Vuex store module to Pinia store structure
 * @param {Object} vuexModule - Vuex module with state, mutations, actions, getters
 * @returns {Object} Pinia-compatible store definition
 */
function convertVuexToPinia(vuexModule) {
  const { state, mutations, actions, getters } = vuexModule;
  
  return {
    state: state || (() => ({})),
    getters: getters || {},
    actions: {
      ...Object.keys(mutations || {}).reduce((acc, key) => {
        acc[key] = function(payload) {
          const mutation = mutations[key];
          mutation.call(this, this.$state, payload);
        };
        return acc;
      }, {}),
      ...actions
    }
  };
}

/**
 * Create Vuex-compatible commit function for Pinia stores
 * @param {Object} store - Pinia store instance
 * @returns {Function} commit function
 */
function createCommit(store) {
  return (mutationName, payload) => {
    if (store[mutationName] && typeof store[mutationName] === 'function') {
      store[mutationName](payload);
    } else {
      console.warn(`Mutation ${mutationName} not found in store`);
    }
  };
}

/**
 * Create Vuex-compatible dispatch function for Pinia stores
 * @param {Object} store - Pinia store instance
 * @returns {Function} dispatch function
 */
function createDispatch(store) {
  return (actionName, payload) => {
    if (store[actionName] && typeof store[actionName] === 'function') {
      return store[actionName](payload);
    } else {
      console.warn(`Action ${actionName} not found in store`);
    }
  };
}

/**
 * Map Vuex helpers to Pinia equivalents
 */
const mapState = (storeName, properties) => {
  const computed = {};
  properties.forEach(prop => {
    computed[prop] = {
      get() {
        const store = this.$pinia.use(storeName);
        return store[prop];
      }
    };
  });
  return computed;
};

const mapGetters = (storeName, getterNames) => {
  const computed = {};
  getterNames.forEach(getter => {
    computed[getter] = {
      get() {
        const store = this.$pinia.use(storeName);
        return store[getter];
      }
    };
  });
  return computed;
};

const mapActions = (storeName, actionNames) => {
  const methods = {};
  actionNames.forEach(action => {
    methods[action] = function(payload) {
      const store = this.$pinia.use(storeName);
      return store[action](payload);
    };
  });
  return methods;
};

const mapMutations = (storeName, mutationNames) => {
  const methods = {};
  mutationNames.forEach(mutation => {
    methods[mutation] = function(payload) {
      const store = this.$pinia.use(storeName);
      if (store[mutation]) {
        return store[mutation](payload);
      }
      console.warn(`Mutation ${mutation} not found in Pinia store ${storeName}`);
    };
  });
  return methods;
};

// Alias functions for compatibility
const migrateVuexModule = convertVuexToPinia;
const useVuexStore = (storeName, pinia) => {
  // Helper to use stores in Vuex-like way
  const store = pinia.use(storeName);
  return {
    state: store.$state,
    getters: store,
    commit: createCommit(store),
    dispatch: createDispatch(store)
  };
};

const createVuexCompatibility = (store) => {
  return {
    commit: createCommit(store),
    dispatch: createDispatch(store),
    state: store.$state,
    getters: store
  };
};

module.exports = {
  convertVuexToPinia,
  createCommit,
  createDispatch,
  mapState,
  mapGetters,
  mapActions,
  mapMutations,
  migrateVuexModule,
  useVuexStore,
  createVuexCompatibility
};