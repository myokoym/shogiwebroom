/**
 * Vue Component Unit Tests
 * Tests basic Vue component functionality using @vue/test-utils
 */

const { mount, createLocalVue } = require('@vue/test-utils');
const Vue = require('vue');

// Simple test component
const TestComponent = Vue.extend({
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
    }
  }
});

describe('Vue Component Tests', () => {
  let localVue;

  beforeEach(() => {
    localVue = createLocalVue();
  });

  test('can create and mount a Vue component', () => {
    const wrapper = mount(TestComponent, {
      localVue,
      stubs: {}  // Override global stubs for clean testing
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.vm).toBeTruthy();  // Use wrapper.vm instead of deprecated isVueInstance
  });

  test('renders component template correctly', () => {
    const wrapper = mount(TestComponent, {
      localVue,
      stubs: {},
      propsData: {
        title: 'Custom Title'
      }
    });

    expect(wrapper.find('h1').text()).toBe('Custom Title');
    expect(wrapper.find('button').text()).toBe('Count: 0');
    expect(wrapper.find('p').text()).toBe('Hello Vue!');
  });

  test('handles prop data correctly', () => {
    const wrapper = mount(TestComponent, {
      localVue,
      stubs: {},
      propsData: {
        title: 'Props Test'
      }
    });

    expect(wrapper.props('title')).toBe('Props Test');
  });

  test('manages component state', () => {
    const wrapper = mount(TestComponent, {
      localVue,
      stubs: {}
    });

    expect(wrapper.vm.count).toBe(0);
    expect(wrapper.vm.message).toBe('Hello Vue!');
    expect(wrapper.vm.showMessage).toBe(true);
  });

  test('handles user interactions', async () => {
    const wrapper = mount(TestComponent, {
      localVue,
      stubs: {}
    });

    const button = wrapper.find('button');
    
    // Initial state
    expect(button.text()).toBe('Count: 0');
    
    // Click button
    await button.trigger('click');
    expect(wrapper.vm.count).toBe(1);
    expect(button.text()).toBe('Count: 1');
    
    // Click again
    await button.trigger('click');
    expect(wrapper.vm.count).toBe(2);
    expect(button.text()).toBe('Count: 2');
  });

  test('conditional rendering works', async () => {
    const wrapper = mount(TestComponent, {
      localVue,
      stubs: {}
    });

    expect(wrapper.find('p').exists()).toBe(true);
    
    // Hide message
    wrapper.setData({ showMessage: false });
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('p').exists()).toBe(false);
  });

  test('component has correct CSS classes', () => {
    const wrapper = mount(TestComponent, {
      localVue,
      stubs: {}
    });

    expect(wrapper.classes()).toContain('test-component');
    expect(wrapper.find('div').classes()).toContain('test-component');
  });

  test('can find elements by selector', () => {
    const wrapper = mount(TestComponent, {
      localVue,
      stubs: {}
    });

    expect(wrapper.find('h1').exists()).toBe(true);
    expect(wrapper.find('button').exists()).toBe(true);
    expect(wrapper.find('p').exists()).toBe(true);
    expect(wrapper.find('.test-component').exists()).toBe(true);
  });

  test('component lifecycle works', () => {
    const mountedSpy = jest.fn();
    
    const ComponentWithLifecycle = Vue.extend({
      template: '<div>Lifecycle Test</div>',
      mounted: mountedSpy
    });

    mount(ComponentWithLifecycle, {
      localVue,
      stubs: {}
    });

    expect(mountedSpy).toHaveBeenCalledTimes(1);
  });

  test('can test component with slots', () => {
    const SlottedComponent = Vue.extend({
      template: `
        <div class="slotted">
          <slot name="header"></slot>
          <slot></slot>
          <slot name="footer"></slot>
        </div>
      `
    });

    const wrapper = mount(SlottedComponent, {
      localVue,
      stubs: {},
      slots: {
        default: '<p>Default slot content</p>',
        header: '<h2>Header slot</h2>',
        footer: '<small>Footer slot</small>'
      }
    });

    expect(wrapper.find('h2').text()).toBe('Header slot');
    expect(wrapper.find('p').text()).toBe('Default slot content');
    expect(wrapper.find('small').text()).toBe('Footer slot');
  });
});

describe('Vue Test Utils Functionality', () => {
  test('@vue/test-utils is properly configured', () => {
    expect(mount).toBeDefined();
    expect(createLocalVue).toBeDefined();
  });

  test('can create local Vue instance', () => {
    const localVue = createLocalVue();
    expect(localVue).toBeDefined();
    expect(typeof localVue).toBe('function');
  });

  test('Vue is available in test environment', () => {
    expect(Vue).toBeDefined();
    expect(Vue.version).toBeDefined();
    expect(typeof Vue.extend).toBe('function');
  });
});