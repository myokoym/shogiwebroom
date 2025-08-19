// Vue 2/3 component compatibility layer
// Provides unified components that work with both Bootstrap Vue and Bootstrap Vue Next

export const BContainer = {
  name: 'BContainer',
  functional: true,
  render(h, context) {
    return h('div', {
      class: ['container', context.data.class],
      attrs: context.data.attrs
    }, context.children)
  }
}

export const BRow = {
  name: 'BRow',
  functional: true,
  render(h, context) {
    return h('div', {
      class: ['row', context.data.class],
      attrs: context.data.attrs
    }, context.children)
  }
}

export const BCol = {
  name: 'BCol',
  functional: true,
  props: {
    cols: String,
    sm: String,
    md: String,
    lg: String,
    xl: String
  },
  render(h, context) {
    const classes = ['col']
    const { cols, sm, md, lg, xl } = context.props
    
    if (cols) classes.push(`col-${cols}`)
    if (sm) classes.push(`col-sm-${sm}`)
    if (md) classes.push(`col-md-${md}`)
    if (lg) classes.push(`col-lg-${lg}`)
    if (xl) classes.push(`col-xl-${xl}`)
    
    return h('div', {
      class: [...classes, context.data.class],
      attrs: context.data.attrs
    }, context.children)
  }
}

export const BButton = {
  name: 'BButton',
  functional: true,
  props: {
    variant: {
      type: String,
      default: 'primary'
    },
    size: String,
    disabled: Boolean,
    type: {
      type: String,
      default: 'button'
    }
  },
  render(h, context) {
    const { variant, size, disabled, type } = context.props
    const classes = ['btn', `btn-${variant}`]
    
    if (size) classes.push(`btn-${size}`)
    
    return h('button', {
      class: [...classes, context.data.class],
      attrs: {
        ...context.data.attrs,
        type,
        disabled
      },
      on: context.data.on
    }, context.children)
  }
}

export const BFormInput = {
  name: 'BFormInput',
  props: {
    value: String,
    type: {
      type: String,
      default: 'text'
    },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean
  },
  render(h) {
    return h('input', {
      class: 'form-control',
      attrs: {
        type: this.type,
        placeholder: this.placeholder,
        disabled: this.disabled,
        readonly: this.readonly
      },
      domProps: {
        value: this.value
      },
      on: {
        input: (event) => {
          this.$emit('input', event.target.value)
        }
      }
    })
  }
}

export const BFormTextarea = {
  name: 'BFormTextarea',
  props: {
    value: String,
    rows: {
      type: Number,
      default: 3
    },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean
  },
  render(h) {
    return h('textarea', {
      class: 'form-control',
      attrs: {
        rows: this.rows,
        placeholder: this.placeholder,
        disabled: this.disabled,
        readonly: this.readonly
      },
      domProps: {
        value: this.value
      },
      on: {
        input: (event) => {
          this.$emit('input', event.target.value)
        }
      }
    })
  }
}

export const BModal = {
  name: 'BModal',
  props: {
    visible: Boolean,
    title: String,
    hideHeader: Boolean,
    hideFooter: Boolean
  },
  render(h) {
    if (!this.visible) return null
    
    return h('div', {
      class: 'modal show d-block',
      style: { backgroundColor: 'rgba(0,0,0,0.5)' }
    }, [
      h('div', { class: 'modal-dialog' }, [
        h('div', { class: 'modal-content' }, [
          !this.hideHeader && h('div', { class: 'modal-header' }, [
            h('h5', { class: 'modal-title' }, this.title),
            h('button', {
              class: 'btn-close',
              on: {
                click: () => this.$emit('hide')
              }
            })
          ]),
          h('div', { class: 'modal-body' }, this.$slots.default),
          !this.hideFooter && h('div', { class: 'modal-footer' }, this.$slots.footer)
        ])
      ])
    ])
  }
}