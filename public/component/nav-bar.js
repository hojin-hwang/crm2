
class NavBar extends AbstractComponent
{
  constructor()
  {
    super();
    this.messageListener = this.onMessage.bind(this)
    window.addEventListener("message", this.messageListener);
    this.addEventListener('click', this.handleClick);
  }

  static get observedAttributes(){return ['degree'];}

  attributeChangedCallback(name, oldValue, newValue)
  {

    if(name === 'degree' && newValue === '대기')
    {
      this.#emptyTag();
    }
    else if(name === 'degree' && newValue !== '관리자')
    {
      this.#removeManagerMenu();
    }
  }

  #emptyTag()
  {
    this.querySelectorAll('.sidebar-link').forEach(link=>{
      link.setAttribute('tag', '');
    })
  }

  #removeManagerMenu()
  {
    this.querySelectorAll('.manager-menu').forEach(menu=>menu.remove());
  }

  #removeMenu()
  {
    this.querySelectorAll('.command-show-custom-board').forEach(menu=>{
      globalThis.userBoardList.forEach(element=>{
        if(menu.getAttribute('boardid') === element.boardId) menu.closest('li').classList.remove('hidden');
      })
    });
  }

  handleClick(e) {
    e.preventDefault();
    e.composedPath().find((node)=>{
      if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
      if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
      if(node.className.match(/command-show-table/))
      {
        if(!node.getAttribute('tag')) return;
        this.#changeTableContents(node);
        this.#activeMenu(node);
        $("#main-wrapper").toggleClass("show-sidebar");
        $("#main-wrapper").toggleClass("mini-sidebar");
        return;
      }
      if(node.className.match(/command-show-custom-board/))
      {
        if(!node.getAttribute('boardid')) return;
        this.#showCustomBoard(node)
        this.#activeMenu(node);
        $("#main-wrapper").toggleClass("show-sidebar");
        $("#main-wrapper").toggleClass("mini-sidebar");
        return;
      }
      if(node.className.match(/command-show-component/))
      {
        if(!node.getAttribute('tag')) return;
        this.#showTagComponent(node);
        this.#activeMenu(node);
        $("#main-wrapper").toggleClass("show-sidebar");
        $("#main-wrapper").toggleClass("mini-sidebar");
        return;
      }
      if(node.className.match(/command-show-sales-list/))
      {
        if(!node.getAttribute('tag')) return;
        this.#showSalesSheetList(node);
        this.#activeMenu(node);
        $("#main-wrapper").toggleClass("show-sidebar");
        $("#main-wrapper").toggleClass("mini-sidebar");
        return;
      }
      if(node.className.match(/command-show-board-set/))
      {
        this.#showBoardInfo();
        this.#activeMenu(node);
        $("#main-wrapper").toggleClass("show-sidebar");
        $("#main-wrapper").toggleClass("mini-sidebar");
        return;
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
          case "SELECT_TABLE_MENU":
            this.#selectTableMenu(event.data.data);
          break;
          case "SELECT_CONTENTS_MENU":
            this.#selectContentsMenu(event.data.data)
          break;
          case "SELECT_BOARD_MENU":
            this.#selectBoardMenu(event.data.data)
          break;
          case "GET_DATA_LIST":
            this.#addCustomBoard(event.data.data)
          break;
          case "GET_USER_BOARD_LIST":
            this.#removeMenu(event.data.data)
          break;
          default:
          break;
            
        }
    }
  }

  #showTagComponent(node)
  {
    const tagName = node.getAttribute('tag');
    const tag = document.createElement(tagName);
    document.querySelector('.container-fluid').innerHTML = '';
    document.querySelector('.container-fluid').appendChild(tag);
  }
  
  #changeTableContents(node)
  {
    const _list = new TableList(globalThis.config[node.getAttribute('tag')]);
    _list.setAttribute('action', 'view');
    _list.setAttribute('id', util.secureRandom())

    document.querySelector('.container-fluid').innerHTML = '';
    document.querySelector('.container-fluid').appendChild(_list);
  }

  #showSalesSheetList(node)
  {
    document.querySelector('.container-fluid').innerHTML = '';
    const _list = new SalesSheetList(globalThis.config[node.getAttribute('tag')]);
    _list.setAttribute('id', util.secureRandom())
    document.querySelector('.container-fluid').appendChild(_list);
  }

  #showBoardInfo()
  {
    return;
    document.querySelector('.container-fluid').innerHTML = '';
    const boardInfo = new BoardInfo();
    document.querySelector('.container-fluid').appendChild(boardInfo);
  }

  

  #showCustomBoard(node)
  {
    document.querySelector('.container-fluid').innerHTML = '';
    const info = globalThis.config["custom-board"]
    info.id = node.getAttribute('boardid');
    info.name = node.getAttribute('boardname')
    document.querySelector('.container-fluid').appendChild(new CustomBoard(info));
  }

  #activeMenu(node)
  {
    this.querySelectorAll('.sidebar-item').forEach(element => {
      element.classList.remove('selected');
    });
    node.closest('.sidebar-item').classList.add('selected');
  }


  connectedCallback()
  {
    this.render();
    //store.getDataList('board-info-list');
  }

  disconnectedCallback(){
    window.removeEventListener("message", this.messageListener);
  }

  render()
  {
    const template = this.#getTemplate();
    if(template) this.appendChild(template.content.cloneNode(true));
    return;
  }

  #selectTableMenu(listName)
  {
    const node = this.#getNode(listName);
    this.#changeTableContents(node);
    this.#activeMenu(node);
    $("#main-wrapper").toggleClass("show-sidebar");
    $("#main-wrapper").toggleClass("mini-sidebar");
  }

  #selectBoardMenu(listName)
  {
    const node = this.#getNode(listName)
    this.#showCustomBoard(node)
    //this.#activeMenu(node);
    $("#main-wrapper").toggleClass("show-sidebar");
    $("#main-wrapper").toggleClass("mini-sidebar");
    return;
  }

  #selectContentsMenu(listName)
  {
    const node = this.#getNode(listName)
    if(listName === 'sales-sheet-list')
    {
      this.#showSalesSheetList(node);
    }
    else{
      this.#showTagComponent(node);
    }
    this.#activeMenu(node);
    $("#main-wrapper").toggleClass("show-sidebar");
    $("#main-wrapper").toggleClass("mini-sidebar");
  }

  #getNode(listName)
  {
    const nodes = this.querySelectorAll('.sidebar-link');
    for(let i=0; i < nodes.length; i++)
    {
      if(nodes[i].getAttribute('tag') === listName) return nodes[i];
    }
  }

  #addCustomBoard(data)
  {
     if(data.listName !== 'board-info-list') return;

     
     const ul = this.querySelector('ul.custom-board-ul');
     ul.innerHTML = ``;
     const titleLi = `<li class="nav-small-cap">
        <i class="ti ti-dots nav-small-cap-icon fs-4"></i><span class="hide-menu">게시판</span>
        </li>
        <li class="sidebar-item">
          <a class="sidebar-link command-show-table" tag="notice-list" action="view" href="#" aria-expanded="false">
            <span>
              <i class="ti ti-bell"></i>
            </span>
            <span class="hide-menu">공지사항</span>
          </a>
        </li>`;
     ul.innerHTML = titleLi;

     data.list.forEach(board=>{
      if(board.type === "custom")
      {
        const li = document.createElement('li');
        li.classList.add("sidebar-item","hidden");
        li.innerHTML = `<a class="sidebar-link command-show-custom-board " tag="${board.id}" boardname="${board.name}" boardid="${board.id}"  href="#" aria-expanded="false">
                 <span>
                   <i class="ti ti-clipboard-text"></i>
                 </span>
                 <span class="hide-menu">${board.name}</span>
               </a>`;
        ul.appendChild(li);       
      }
     })
  }


  #getTemplate()
  {
      const tempalate = document.createElement('template');
      tempalate.innerHTML = `
        <aside class="left-sidebar">
  <!-- Sidebar scroll-->
  <div>
    <div class="brand-logo d-flex align-items-center justify-content-between">
      <a href=".#" class="text-nowrap logo-img">
        <img src="/img/logos/dark-logo.png" width="180" alt="" />
      </a>
      <div class="close-btn d-xl-none d-block sidebartoggler cursor-pointer" id="sidebarCollapse">
        <i class="ti ti-x fs-8"></i>
      </div>
    </div>
    <!-- Sidebar navigation-->
    <nav class="sidebar-nav scroll-sidebar" data-simplebar="">
      <ul id="sidebarnav">
        <li class="nav-small-cap">
          <i class="ti ti-dots nav-small-cap-icon fs-4"></i>
          <span class="hide-menu">Home </span>
        </li>
        <li class="sidebar-item selected">
          <a class="sidebar-link command-show-component" tag="dash-board" href="#" aria-expanded="false">
            <span>
              <i class="ti ti-layout-dashboard"></i>
            </span>
            <span class="hide-menu">Dashboard</span>
          </a>
        </li>
        <li class="sidebar-item">
          <a class="sidebar-link command-show-component" tag="calendar-board" href="#" aria-expanded="false">
            <span>
              <i class="ti ti-calendar"></i>
            </span>
            <span class="hide-menu">캘린더</span>
          </a>
        </li>
        <li class="sidebar-item">
          <a class="sidebar-link command-show-sales-list" tag="sales-sheet-list" action="view" href="#" aria-expanded="false" >
          <!--<a class="sidebar-link command-show-component" tag="sales-sheet-list" href="#" aria-expanded="false">-->
            <span>
              <i class="ti ti-book-upload"></i>
            </span>
            <span class="hide-menu">영업기회</span>
          </a>
        </li>
        <li class="nav-small-cap">
          <i class="ti ti-dots nav-small-cap-icon fs-4"></i>
          <span class="hide-menu">영업</span>
        </li>
        
        <li class="sidebar-item">
          <a class="sidebar-link  command-show-table" tag="sales-work-list" action="view" href="#" aria-expanded="false">
            <span>
              <i class="ti ti-briefcase"></i>
            </span>
            <span class="hide-menu">영업일지</span>
          </a>
        </li>
        
        <li class="nav-small-cap">
          <i class="ti ti-dots nav-small-cap-icon fs-4"></i>
          <span class="hide-menu">정보관리</span>
        </li>
        <li class="sidebar-item">
          <a class="sidebar-link command-show-table" tag="company-list" action="view" href="#" aria-expanded="false">
            <span>
              <i class="ti ti-building-factory-2"></i>
            </span>
            <span class="hide-menu">고객사</span>
          </a>
        </li>
        <li class="sidebar-item">
          <a class="sidebar-link  command-show-table" tag="customer-list" action="view" href="#" aria-expanded="false">
            <span>
              <i class="ti ti-users"></i>
            </span>
            <span class="hide-menu">고객</span>
          </a>
        </li>
        <li class="sidebar-item">
          <a class="sidebar-link command-show-table" tag="product-list" action="view" href="#" aria-expanded="false">
            <span>
              <i class="ti ti-plant"></i>
            </span>
            <span class="hide-menu">품목</span>
          </a>
        </li>

        <!--<li class="sidebar-item">
          <a class="sidebar-link command-show-table" tag="work-list" action="view" href="#" aria-expanded="false">
            <span>
              <i class="ti ti-file-description"></i>
            </span>
            <span class="hide-menu">할일관리</span>
          </a>
        </li>-->
        
        <!--<li class="nav-small-cap manager-menu">
            <i class="ti ti-dots nav-small-cap-icon fs-4"></i>
            <span class="hide-menu">게시판</span>
        </li>-->

        <ul class="custom-board-ul">
          
        </ul>

        <li class="nav-small-cap manager-menu">
          <i class="ti ti-dots nav-small-cap-icon fs-4"></i>
          <span class="hide-menu">관리자</span>
        </li>
        <!--<li class="sidebar-item manager-menu">
          <a class="sidebar-link command-show-table" tag="notice-list" action="view" href="#" aria-expanded="false">
            <span>
              <i class="ti ti-bell"></i>
            </span>
            <span class="hide-menu">공지사항</span>
          </a>
        </li>-->
        <li class="sidebar-item manager-menu">
          <a class="sidebar-link command-show-table" tag="user-list" action="view" href="#" aria-expanded="false">
            <span>
              <i class="ti ti-user"></i>
            </span>
            <span class="hide-menu">사용자 관리</span>
          </a>
        </li>
        <li class="sidebar-item manager-menu">
          <a class="sidebar-link command-show-board-set" href="#" aria-expanded="false">
            <span>
              <i class="ti ti-clipboard-text"></i>
            </span>
            <span class="hide-menu">게시판 관리</span>
          </a>
        </li>
      </ul>
    </nav>
    <!-- End Sidebar navigation -->
  </div>
  <!-- End Sidebar scroll-->
</aside>
      `;  
      return tempalate;
  }
}
customElements.define("nav-bar", NavBar);

