
class AlertMessage extends HTMLElement{
    constructor(data)
    {
        super();   
        this.data = {};
        Object.assign(this.data, data)
        this.#render();
     }
    static get observedAttributes() {return []; }
     

    #render()
    {
        $.notify({
            // options
            icon: this.#getIcon(),
            title: this.data.title,
            message: this.data.message
          },{
            // settings
            type: (this.data.type)? this.data.type : 'info',
            delay: 2000,
            icon_type: 'class'
            
          });
        return;
    }

    #getIcon()
    {
      let iconClass = 'fa fa-bell'
      switch (this.data.type) {
        case  'danger':
          iconClass = 'fas fa-exclamation'
        break;
        case  'info':
          iconClass = 'fa fa-bell'
        break;  
        case  'warning':
          iconClass = 'fas fa-bullhorn'
        default:
        break;
      }
      return iconClass;
    }
  }
  customElements.define('alert-message', AlertMessage);
  
  
  
  
  
   
  
  
  