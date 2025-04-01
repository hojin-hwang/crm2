
class SearchList extends AbstractComponent
{
  constructor(info)
  {
    super();
    this.addEventListener('click', this.handleClick);
    this.info = (info)? info : {title:""};
    
    this.messageListener = this.onMessage.bind(this)
    window.addEventListener("message", this.messageListener);
  }

  static get observedAttributes(){return [];}

  handleClick(e) {
    e.composedPath().find((node)=>{
      if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
      if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
      if(node.className.match(/command-close-search/))
      {
        this.#hideModal();
        this.#createTableElement();
      }
    });
  }

  
  onMessage(event)
  {
    const window_url = window.location.hostname;
    if(event.origin.indexOf(window_url) < 0) return;
    if(event.data.msg)
    {
        switch(event.data.msg)
        {
          case "HIDE_SEARCH_LIST":
            this.#hideModal();
          break;
          case "SET_SEARCH_SELECT":
            this.#hideModal();
          break;
          case "GET_SEARCH_DATA_LIST":
            
            if(!this.info.title) return;
            this.info.list = event.data.data;
            this.#appendTable();
            setTimeout(() => {
              this.#removeLabel();
            }, 20);
          break;
          default:
          break;
        }
    }
  }

  connectedCallback()
  {
    this.render();
  }

  disconnectedCallback()
  {
    window.removeEventListener("message", this.messageListener);
    this.removeEventListener("click", this.handleClick)
  }

  render()
  {
    const template = this.#getTemplate();
    if(template) this.appendChild(template.content.cloneNode(true));
    
    return;
  }

  #removeLabel()
  {
    this.querySelector('.dt-search label')?.remove();
  }

  init()
  {
    this.table?.clear();
    this.info = {title:""};
    this.querySelector("#search_list").innerHTML = "";
  }

  setData(info)
  {
    this.info = {};
    Object.assign(this.info, info);
    store.getDataList(this.info.collection, true);
    this.#showModal();
  }

  #setTable()
  {
    if(this.table)
    {
      this.#createTableElement()
    }

    this.table = new DataTable('#search_list', {
      retrieve: true,
      layout: {
        topEnd:null,
        topStart: {
            search: {
                label:"",
                placeholder: 'Search'
            }
        }
     },
      info:false,
      select: {
        style:'single'
      },
      displayLength:15,
      columns: this.info.columns,
      data: this.info.list,
      order: [[1, 'asc']],
      columnDefs: [
        {
            target: 0,
            visible: false
        }
      ]
    });

    return this.table;
  }

  #appendTable()
  {
    const table = this.#setTable();
    const formName = this.info.formName;
    const targetField = this.info.targetField;
    if(!table) return;

    this.#addCloseButton();

    table.on( 'click', 'tr', function(){
      if ( $(this).parent().prop("tagName") === 'THEAD' ) return;
      if ( $(this).hasClass('selected') ) {
        $(this).removeClass('selected');
      }
      else {
          table.$('tr.selected').removeClass('selected');
          $(this).addClass('selected');
      }
      
      let this_row = table.rows(this).data();
        const _tempInfo = {"tagName":formName, "field": targetField,"info":this_row[0]}
        const _message = {msg:"SET_SEARCH_SELECT", data:_tempInfo}
        window.postMessage(_message, location.href);
    } );
  }

  #addCloseButton()
  {
    const addButton = document.createElement('div');
    addButton.innerHTML = `<button type="button" class="btn btn-icon btn-black command-close-search">
                <i class="fas fa-times"></i></button>`;
    this.querySelector('.dt-layout-row')?.appendChild(addButton);
  }

  #showModal()
  {
      const body = this.querySelector('.search-list');
      body.style.transform = "translate3d(270px, 0px, 0px)";
      body.style.transition = "all 0.5s";
  }

  #hideModal()
  {
    const body = this.querySelector('.search-list');  
    body.style.transform = "translate3d(-100%, 0px, 0px)";
    body.style.transition = "all 0.5s";
  }

  #createTableElement()
  {
    this.querySelector('#search_list_wrapper')?.remove();
    const table = document.createElement('table');
    table.setAttribute('id', 'search_list');
    table.setAttribute('width', '100%');
    this.querySelector('.search-list').appendChild(table);
    this.table = null;
  }

  #getTemplate()
  {
      const tempalate = document.createElement('template');
      tempalate.innerHTML = `
      <style>
        .search-list{
          display: flex;
          width: 270px;
          height: 100vh;
          background: #1a2036;
          color: white;
          position: fixed;
          top: 0;
          left: -270px;
          z-index: 1024;
          flex-direction: column;
          padding: 12px;
          border-right: 1px solid #f6f9
        }
        .search-list-title{
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      </style>
        <div class="search-list">
          
          <table id="search_list"  width="100%"></table>
        </div>
      `;  
      return tempalate;
  }
}
customElements.define("search-list", SearchList);

