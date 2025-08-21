// Bootstrap Vue to Bootstrap Vue Next compatibility mapping
// This will be used during the migration from Vue 2 to Vue 3

export const componentMapping = {
  // Layout Components
  'b-container': 'BContainer',
  'b-row': 'BRow',
  'b-col': 'BCol',
  
  // Form Components
  'b-form': 'BForm',
  'b-form-group': 'BFormGroup',
  'b-form-input': 'BFormInput',
  'b-form-textarea': 'BFormTextarea',
  'b-form-select': 'BFormSelect',
  'b-form-checkbox': 'BFormCheckbox',
  'b-form-radio': 'BFormRadio',
  
  // Button Components
  'b-button': 'BButton',
  'b-button-group': 'BButtonGroup',
  
  // Navigation Components
  'b-nav': 'BNav',
  'b-nav-item': 'BNavItem',
  'b-navbar': 'BNavbar',
  'b-navbar-brand': 'BNavbarBrand',
  'b-navbar-nav': 'BNavbarNav',
  
  // Modal Components
  'b-modal': 'BModal',
  
  // Card Components
  'b-card': 'BCard',
  'b-card-body': 'BCardBody',
  'b-card-header': 'BCardHeader',
  'b-card-footer': 'BCardFooter',
  
  // Table Components
  'b-table': 'BTable',
  
  // Alert Components
  'b-alert': 'BAlert',
  
  // Badge Components
  'b-badge': 'BBadge',
  
  // Dropdown Components
  'b-dropdown': 'BDropdown',
  'b-dropdown-item': 'BDropdownItem',
  
  // List Group Components
  'b-list-group': 'BListGroup',
  'b-list-group-item': 'BListGroupItem',
  
  // Progress Components
  'b-progress': 'BProgress',
  'b-progress-bar': 'BProgressBar',
  
  // Spinner Components
  'b-spinner': 'BSpinner',
  
  // Toast Components
  'b-toast': 'BToast',
  'b-toaster': 'BToaster'
}

// Property mapping for common changes
export const propMapping = {
  // Variant changes
  'variant': 'variant',
  'size': 'size',
  'disabled': 'disabled',
  'readonly': 'readonly',
  
  // Form specific
  'value': 'modelValue',
  'checked': 'modelValue',
  
  // Modal specific
  'visible': 'modelValue',
  'hide-header': 'hideHeader',
  'hide-footer': 'hideFooter',
  
  // Table specific
  'items': 'items',
  'fields': 'fields',
  'busy': 'busy',
  'hover': 'hover',
  'striped': 'striped',
  'bordered': 'bordered'
}

// Event mapping for common changes
export const eventMapping = {
  // Form events
  'input': 'update:modelValue',
  'change': 'change',
  
  // Modal events
  'show': 'show',
  'shown': 'shown',
  'hide': 'hide',
  'hidden': 'hidden',
  
  // General events
  'click': 'click'
}

// Helper function to migrate component usage
export function migrateComponent(oldComponent) {
  return componentMapping[oldComponent] || oldComponent
}

// Helper function to migrate props
export function migrateProps(props) {
  const migrated = {}
  
  for (const [key, value] of Object.entries(props)) {
    const newKey = propMapping[key] || key
    migrated[newKey] = value
  }
  
  return migrated
}

// Helper function to migrate events
export function migrateEvent(oldEvent) {
  return eventMapping[oldEvent] || oldEvent
}