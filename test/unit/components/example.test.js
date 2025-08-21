/**
 * Vue 3 Component Unit Tests
 * Tests basic Vue 3 component functionality using @vue/test-utils
 */

const { mount } = require('@vue/test-utils');
const { defineComponent, h } = require('vue');

// Simple test component for Vue 3
const TestComponent = defineComponent({
  template: `
    <div class="test-component">
      <h1>{{ title }}</h1>
      <button @click="increment">Count: {{ count }}</button>
      <p v-if="showMessage">{{ message }}</p>
    </div>
  `,
  props: {
    title: {
      type: String,
      default: 'Test Component'
    }
  },
  data() {
    return {
      count: 0,
      message: 'Hello Vue!',
      showMessage: true
    };
  },
  methods: {
    increment() {
      this.count++;
    },
    toggleMessage() {
      this.showMessage = !this.showMessage;
    }
  }
});

describe('Vue 3 Component Tests', () => {
  test('can create and mount a Vue component', () => {
    const wrapper = mount(TestComponent, {
      global: {
        stubs: {}
      }
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.vm).toBeTruthy();
  });

  test('renders component template correctly', () => {
    const wrapper = mount(TestComponent, {
      props: {
        title: 'Custom Title'
      },
      global: {
        stubs: {}
      }
    });

    expect(wrapper.find('h1').text()).toBe('Custom Title');
    expect(wrapper.find('button').text()).toBe('Count: 0');
    expect(wrapper.find('p').text()).toBe('Hello Vue!');
  });

  test('handles prop data correctly', () => {
    const wrapper = mount(TestComponent, {
      props: {
        title: 'Props Test'
      },
      global: {
        stubs: {}
      }
    });

    expect(wrapper.props('title')).toBe('Props Test');
  });

  test('manages component state', () => {
    const wrapper = mount(TestComponent, {
      global: {
        stubs: {}
      }
    });

    expect(wrapper.vm.count).toBe(0);
    expect(wrapper.vm.message).toBe('Hello Vue!');
    expect(wrapper.vm.showMessage).toBe(true);
  });

  test('handles user interactions', async () => {
    const wrapper = mount(TestComponent, {
      global: {
        stubs: {}
      }
    });

    const button = wrapper.find('button');
    
    // Initial state
    expect(button.text()).toBe('Count: 0');
    
    // Click button
    await button.trigger('click');
    expect(wrapper.vm.count).toBe(1);
    expect(button.text()).toBe('Count: 1');
    
    // Multiple clicks
    await button.trigger('click');
    await button.trigger('click');
    expect(wrapper.vm.count).toBe(3);
    expect(button.text()).toBe('Count: 3');
  });

  test('conditional rendering works correctly', async () => {
    const wrapper = mount(TestComponent, {
      global: {
        stubs: {}
      }
    });

    // Message should be visible initially
    expect(wrapper.find('p').exists()).toBe(true);
    
    // Toggle message visibility
    wrapper.vm.toggleMessage();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('p').exists()).toBe(false);
    
    // Toggle back
    wrapper.vm.toggleMessage();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('p').exists()).toBe(true);
  });

  test('component can be destroyed properly', () => {
    const wrapper = mount(TestComponent, {
      global: {
        stubs: {}
      }
    });

    expect(wrapper.exists()).toBe(true);
    
    wrapper.unmount();
    // After unmounting, the wrapper should still exist but DOM element is removed
    expect(() => wrapper.find('h1')).not.toThrow();
  });
});