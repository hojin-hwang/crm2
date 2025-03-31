class NavBar extends AbstractComponent
{
  constructor(info)
  {
    super();
    if(info) Object.assign(this.info, info);
  }

  handleClick(e) {
    e.preventDefault();
    e.composedPath().find((node)=>{
      if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
      if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
      if(node.className.match(/command-user-logout/))
      {
        location.href = `/auth//logout/${globalThis.user.clientId}`
        return;
      }
      if(node.className.match(/command-show-password-form/))
      {
        this.#showPasswordForm();
        return;
      }
      if(node.className.match(/command-show-nav-left/))
      {
        const _message = {msg:"DO_SHOW_NAV_LEFT", data:null}
        window.postMessage(_message, location.href);
        return;
      }
      
    });
  }

  render()
  {
    const template = this.#getTemplate();
    if(template) this.appendChild(template.content.cloneNode(true));
    return;
  }

  #showPasswordForm()
  {
    const _tempInfo = {"tagName":'password-form', "info":this.info}
    const _message = {msg:"DO_SHOW_MODAL", data:_tempInfo}
    window.postMessage(_message, location.href);
  }


  #getTemplate()
  {
      const tempalate = document.createElement('template');
      tempalate.innerHTML = `
        <div class="main-header">
          <div class="main-header-logo">
            <!-- Logo Header -->
            <div class="logo-header" data-background-color="dark">
              <a href="/crm/${globalThis.user.clientId}" class="logo">
                <span class="logo-title">Simple CRM</span>
              </a>
              <div class="nav-toggle command-show-nav-left">
                <button class="btn btn-toggle toggle-sidebar">
                  <i class="gg-menu-right"></i>
                </button>
                <button class="btn btn-toggle sidenav-toggler">
                  <i class="gg-menu-left"></i>
                </button>
              </div>
              <button class="topbar-toggler more">
                <i class="gg-more-vertical-alt"></i>
              </button>
            </div>
            <!-- End Logo Header -->
          </div>
          <!-- Navbar Header -->
          <nav
            class="navbar navbar-header navbar-header-transparent navbar-expand-lg border-bottom"
          >
            <div class="container-fluid">

              <ul class="navbar-nav topbar-nav ms-md-auto align-items-center">
                <li class="nav-item topbar-user dropdown hidden-caret">
                  <a
                    class="dropdown-toggle profile-pic"
                    data-bs-toggle="dropdown"
                    href="#"
                    aria-expanded="false"
                  >
                    <div class="avatar-sm">
                      <img
                        src="${globalThis.user.profile}"
                        alt="..."
                        class="avatar-img rounded-circle"
                      />
                    </div>
                    <span class="profile-username">
                      <span class="op-7">Hi,</span>
                      <span class="fw-bold">${globalThis.user.name}</span>
                    </span>
                  </a>
                  <ul class="dropdown-menu dropdown-user animated fadeIn">
                    <div class="dropdown-user-scroll scrollbar-outer">
                      <li>
                        <a class="dropdown-item command-show-password-form" href="#">Password Setting</a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item command-user-logout" href="#">Logout</a>
                      </li>
                    </div>
                  </ul>
                </li>
              </ul>
            </div>
          </nav>
          <!-- End Navbar -->
        </div>
      `;  
      return tempalate;
  }
}
customElements.define("nav-bar", NavBar);

