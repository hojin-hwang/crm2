
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
            icon: (this.data.icon)? this.data.icon : 'fa fa-bell',
            title: this.data.title,
            message: this.data.message
          },{
            // settings
            type: (this.data.type)? this.data.type : 'info',
            delay: 3000,
            icon_type: 'class'
            
          });
        return;
    }
  }
  customElements.define('alert-message', AlertMessage);
  
  
  
  
  
   
  
  
  