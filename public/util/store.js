class Store{
	constructor()
	{
		globalThis.productList = [];
		globalThis.materialList = [];
		globalThis.assembleList = [];
		globalThis.companyList = [];
		globalThis.customerList = [];
		globalThis.workList = [];
		globalThis.salesWorkList = [];
		globalThis.noticeList = [];
		globalThis.userList = [];
		globalThis.salesSheetList = [];
		globalThis.boardInfoList = [];
		globalThis.userBoardList = [];
	}
	
	getInfo(listName, fieldName, value)
	{
		const _listInfo = this.selectStoreList(listName)

		for(let i=0; i< _listInfo.list.length; i++)
		{
			if(_listInfo.list[i][fieldName].toString() === value.toString()) return _listInfo.list[i]
		}
		return null;
	}

	addInfo(formData, listName, command)
	{
		const info = {};

		for (const pair of formData.entries()) {
			info[pair[0]] = pair[1];
		}
		info['date'] = util.getDayDashFormat(new Date())

		if(!info["id"]) 
		{
			info["id"] = util.secureRandom();
			formData.append("id", info["id"]);
		}

		ttb.get_json_request("POST", this.addApiUrl(listName), formData, (response)=>
		{
				if (100 == response.code)
				{

					const _listInfo = this.selectStoreList(listName, command)
					if(_listInfo)
					{
						_listInfo.list?.push(info);
						_listInfo.info = info;
						_listInfo.listName = listName;
					}

					const message = {msg:command, data:_listInfo}
					window.postMessage(message, location.href);
					return;
				}
				else
				{
						if (response.message) alert(response.message, true);
						else console.dir(response); 
				}       
		});

		return;
	}

	deleteInfo(formData, listName, command)
	{
		const info = {};
		for (const pair of formData.entries()) {
			info[pair[0]] = pair[1];
		}
		formData.append('used', 'N')	
		//ttb.get_json_request("POST", _url, formData, (response)=>
		util.sendFormData(this.updateApiUrl(listName), "POST", formData ).then((response) => 
		{
				if (100 == response.code)
				{
					const _listInfo = this.selectStoreList(listName, command)
					let startIndex = _listInfo.list.length;
					for(let i=0; i< _listInfo.list.length; i++)
					{
						if(_listInfo.list[i]["_id"].toString() === info["_id"].toString()) startIndex = i;
					}
					_listInfo.list.splice(startIndex, 1);
					_listInfo.listName = listName;
					const message = {msg:command, data:_listInfo}
					window.postMessage(message, location.href);
				}
				else
				{
						if (response.message) alert(response.message, true);
						else console.dir(response); 
				}       
		});
	}

	removeInfo(formData, listName, command)
	{
		const info = {};
		for (const pair of formData.entries()) {
			info[pair[0]] = pair[1];
		}

		ttb.get_json_request("POST", this.deleteApiUrl(listName), formData, (response)=>
		{
				if (100 == response.code)
				{
					const message = {msg:command, data:null}
					window.postMessage(message, location.href);
				}
				else
				{
						if (response.message) alert(response.message, true);
						else console.dir(response); 
				}       
		});
	}

	updateInfo(formData, listName, command)
	{
		const info = {};
		for (const pair of formData.entries()) {
			info[pair[0]] = pair[1];
		}
		info['date'] = util.getDayDashFormat(new Date())

		util.sendFormData(this.updateApiUrl(listName), "POST", formData ).then((response) => {
			if (100 == response.code)
				{
					const _listInfo = this.selectStoreList(listName, command)
					for(let i=0; i< _listInfo.list.length; i++)
					{
						if(_listInfo.list[i]["_id"].toString() === info["_id"].toString()) _listInfo.list[i] = info;
					}
					_listInfo.info = info;
					_listInfo.listName = listName;

					const message = {msg:command, data:_listInfo}
					window.postMessage(message, location.href);

					return;
				}
				else
				{
						if (response.message) alert(response.message, true);
						else console.dir(response); 
				} 
		});

		// ttb.get_json_request("POST", this.updateApiUrl(listName), formData, (response)=>
		// {
		// 		if (100 == response.code)
		// 		{
		// 			const _listInfo = this.selectStoreList(listName, command)
		// 			for(let i=0; i< _listInfo.list.length; i++)
		// 			{
		// 				if(_listInfo.list[i]["id"].toString() === info["id"].toString()) _listInfo.list[i] = info;
		// 			}
		// 			_listInfo.info = info;
		// 			_listInfo.listName = listName;

		// 			const message = {msg:command, data:_listInfo}
		// 			window.postMessage(message, location.href);

		// 			return;
		// 		}
		// 		else
		// 		{
		// 				if (response.message) alert(response.message, true);
		// 				else console.dir(response); 
		// 		}       
		// });
	}


	selectStoreList(listName, command = null)
	{
		const storeList = {};
		storeList.command = command ;
		switch(listName)
		{
			case 'product-list':
				storeList.list = globalThis.productList;
			break;
			case 'material-list':
				storeList.list = globalThis.materialList;
			break;
			case 'assemble-list':
				storeList.list = globalThis.assembleList;
			break;	
			case 'company-list':
				storeList.list = globalThis.companyList;
			break;
			case 'user-list':
				storeList.list = globalThis.userList;
			break;
			case 'customer-list':
				storeList.list = globalThis.customerList;
			break;
			case 'notice-list':
				storeList.list = globalThis.noticeList;
			break;
			case 'work-list':
				storeList.list = globalThis.workList;
			break;
			case 'sales-work-list':
				storeList.list = globalThis.salesWorkList;
			break;
			case 'sales-sheet-list':
				storeList.list = globalThis.salesSheetList;
			break;
			case 'board-info-list':
				storeList.list = globalThis.boardInfoList;
			break;
			case 'user-board-list':
				storeList.list = globalThis.userBoardList;
			break;
		}
		return storeList;
	}


	getDataList(listName, search = false, command = "GET_DATA_LIST", _formData = null)
	{
		const formData = (_formData)? _formData : new FormData();
		util.sendFormData(this.getListApiUrl(listName), "POST", formData).then((response) => {
			if (100 == response.code)
				{
					this.getGlobalList(listName, response.list);
					const message = (search)? {msg:"GET_SEARCH_DATA_LIST", data:response.list} :{msg:command, data:{listName:listName, list:response.list}}
					window.postMessage(message, location.href);
					return;
				}
				else
				{
						if (response.message) alert(response.message, true);
						else console.dir(response); 
				} 
		});

		// ttb.get_json_request("POST", this.getListApiUrl(listName), formData, (response)=>
		// {
		// 		if (100 == response.code)
		// 		{
		// 			this.getGlobalList(listName, response.list);
		// 			const message = (search)? {msg:"GET_SEARCH_DATA_LIST", data:response.list} :{msg:command, data:{listName:listName, list:response.list}}
		// 			window.postMessage(message, location.href);
		// 			return;
		// 		}
		// 		else
		// 		{
		// 				if (response.message) alert(response.message, true);
		// 				else console.dir(response); 
		// 		}       
		// });
	}

	getCustomBoard(id)
	{
		const formData = new FormData();
		formData.append("boardId", id);

		ttb.get_json_request("POST", '/api/crm/board/getList', formData, (response)=>
		{
				if (100 == response.code)
				{
					const message = {msg:"GET_BOARD_LIST", data:response.list}
					window.postMessage(message, location.href);
					return;
				}
				else
				{
						if (response.message) alert(response.message, true);
						else console.dir(response); 
				}       
		});
	}

	getListApiUrl(listName)
	{
		let api_url = '';
		switch(listName)
		{
			case 'product-list':
				api_url = "/api/crm/product/getList";
			break;
			case 'item-list':
				api_url = "/api/crm/product/getItemList";
			break;
			case 'material-list':
				api_url = "/api/crm/product/getMaterialList";
			break;	
			case 'company-list':
				api_url = "/api/crm/company/getCompanyList";
			break;
			case 'customer-list':
				api_url = "/api/crm/customer/getCustomerList";
			break;
			case 'user-list':
				api_url = "/user/list";
			break;
			case 'notice-list':
				api_url = "/api/crm/notice/getNoticeList";
			break;
			case 'work-list':
				api_url = "/api/crm/work/getWorkList";
			break;
			case 'sales-work-list':
				api_url = "/api/crm/work/getWorkList";
			break;
			case 'sales-sheet-list':
				api_url = "/api/crm/sheet/getSheetList";
			break;
			case 'board-info-list':
				api_url = "/api/crm/board/getBoardList";
			break;
			case 'board-user-list':
				api_url = "/api/crm/board/getBoardUserList";
			break;
			case 'user-board-list':
				api_url = "/api/crm/board/getUserBoardList";
			break;
			
		}
		return api_url;
	}

	addApiUrl(listName)
	{
		let api_url = '';
		switch(listName)
		{
			case 'product-list':
				api_url = "/api/crm/product/addProduct";
			break;	
			case 'company-list':
				api_url = "/api/crm/company/addCompany";
			break;
			case 'customer-list':
				api_url = "/api/crm/customer/addCustomer";
			break;
			case 'user-list':
				api_url = "/api/crm/user/addUser";
			break;
			case 'notice-list':
				api_url = "/api/crm/notice/addNotice";
			break;
			case 'work-list':
				api_url = "/api/crm/work/addWork2";
			break;
			case 'sales-work-list':
				api_url = "/api/crm/work/addWork";
			break;
			case 'sales-sheet-list':
				api_url = "/api/crm/sheet/addSheet";
			break;
			case 'board-info-list':
				api_url = "/api/crm/board/addBoard";
			break;
			case 'board-user-list':
				api_url = "/api/crm/board/addBoardUser";
			break;
		}
		return api_url;
	}

	updateApiUrl(listName)
	{
		let api_url = '';
		switch(listName)
		{
			case 'product-list':
				api_url = "/api/crm/product/updateProduct";
			break;	
			case 'company-list':
				api_url = "/api/crm/company/updateCompany";
			break;
			case 'customer-list':
				api_url = "/api/crm/customer/updateCustomer";
			break;
			case 'notice-list':
				api_url = "/api/crm/notice/updateNotice";
			break;
			case 'user-list':
				api_url = "/user/update";
			break;
			case 'work-list':
				api_url = "/api/crm/work/updateWork2";
			break;
			case 'sales-work-list':
				api_url = "/api/crm/work/updateWork";
			break;
			case 'sales-sheet-list':
				api_url = "/api/crm/sheet/updateSheet";
			break;
			case 'board-info-list':
				api_url = "/api/crm/board/updateBoard";
			break;
		}
		return api_url;
	}

	deleteApiUrl(listName)
	{
		let api_url = '';
		switch(listName)
		{
			case 'product-list':
				api_url = "/api/crm/product/deleteProduct";
			break;	
			case 'company-list':
				api_url = "/api/crm/company/deleteCompany";
			break;
			case 'customer-list':
				api_url = "/api/crm/customer/deleteCustomer";
			break;
			case 'notice-list':
				api_url = "/api/crm/notice/deleteNotice";
			break;
			case 'work-list':
				api_url = "/api/crm/work/deleteWork2";
			break;
			case 'sales-work-list':
				api_url = "/api/crm/work/deleteWork";
			break;
			case 'sales-sheet-list':
				api_url = "/api/crm/sheet/deleteSheet";
			break;
			case 'board-info-list':
				api_url = "/api/crm/board/deleteBoard";
			break;
			case 'board-user-list':
				api_url = "/api/crm/board/deleteBoardUser";
			break;
			case 'board-list':
				api_url = "/api/crm/board/delete";
			break;
		}
		return api_url;
	}

	getGlobalList(listName, list)
	{
		switch(listName)
		{
			case 'product-list':
			globalThis.productList = list;
			break;
			case 'material-list':
			globalThis.materialList = list;
			break;
			case 'assemble-list':
			globalThis.assembleList = list;
			break;	
			case 'company-list':
				globalThis.companyList = list;
			break;
			case 'customer-list':
				globalThis.customerList = list;
			break;
			case 'user-list':
				globalThis.userList = list;
			break;
			case 'notice-list':
				globalThis.noticeList = list;
			break;
			case 'work-list':
				globalThis.workList = list;
			break;
			case 'sales-work-list':
				globalThis.salesWorkList = list;
			break;
			case 'sales-sheet-list':
				globalThis.salesSheetList = list;
			break;
			case 'board-info-list':
				globalThis.boardInfoList = list;
			break;
			case 'user-board-list':
				globalThis.userBoardList = list;
			break;
		}
	}

	setMaterialList(list)
	{
		if(list)
		{
			const list_ = list.reduce((acc, item) => {
				if(item.code === '원재료')  acc.push(item);
				return acc;
			}, []);
			return list_;
		}
	}

	setProductList(list)
	{
		if(list)
		{
			const list_ = list.reduce((acc, item) => {
				if(item.code !== '원재료')  acc.push(item);
				return acc;
			}, []);
			return list_;
		}
	}

	getSheetSalesWorkList(sheetId)
	{
		const formData = new FormData();
		formData.append('sheet', sheetId)
		ttb.get_json_request("POST", this.getListApiUrl('sales-work-list'), formData, (response)=>
		{
				if (100 == response.code)
				{
					const message = {msg:"GET_SALES_WORK_LIST", data:response.list}
					window.postMessage(message, location.href);
					return;
				}
				else
				{
						if (response.message) alert(response.message, true);
						else console.dir(response); 
				}       
		});
	}

	getSheetSalesMemoList(sheetId)
	{
		const formData = new FormData();
		formData.append('sheet', sheetId)
		ttb.get_json_request("POST", "/api/crm/memo/getMemoList", formData, (response)=>
		{
				if (100 == response.code)
				{
					const message = {msg:"GET_SALES_MEMO_LIST", data:response.list}
					window.postMessage(message, location.href);
					return;
				}
				else
				{
						if (response.message) alert(response.message, true);
						else console.dir(response); 
				}       
		});
	}
	

	addSheetWorkMemo(formData)
	{
		const info = {};

		for (const pair of formData.entries()) {
			info[pair[0]] = pair[1];
		}
		info['id'] = util.secureRandom();
		info['date'] = util.getDayDashFormat(new Date())

		formData.append("id", info['id']);

		ttb.get_json_request("POST", "/api/crm/memo/addMemo", formData, (response)=>
		{
				if (100 == response.code)
				{
					const message = {msg:"ADD_SHEET_WORK_MEMO", data:info}
					window.postMessage(message, location.href);
				}
				else
				{
						if (response.message) alert(response.message, true);
						else console.dir(response); 
				}       
		});
		return;
	}


	removeSheetWorkMemo(formData)
	{
		ttb.get_json_request("POST", "/api/crm/memo/deleteMemo", formData, (response)=>
		{
				if (100 == response.code)
				{
				}
				else
				{
						if (response.message) alert(response.message, true);
						else console.dir(response); 
				}       
		});
		return;
	}

	setInitConfig(){

		globalThis.config = {
			"sales-sheet-list":{
				"title":"영업기회 리스트",
				"buttonTitle":"영업기회 등록",
				"listName":"sales-sheet-list",
				"formName":"sales-sheet-form",
				"boardId":"615103576",
				"columnInvisible":[0,8,9]
			},
			"product-list":{
				"title":"품목 리스트",
				"buttonTitle":"품목 등록",
				"listName":"product-list",
				"formName":"product-form",
				"boardId":"2498029936",
				"columns":[
					{ "data": "id", "title":"id"},
					{ "data": "code", "title":"제품코드"},
					{ "data": "name", "title":"제품이름" },
					{ "data": "brand", "title":"제조사" }
				]
			},
			"company-list":{
				"title":"고객사 리스트",
				"buttonTitle":"신규 고객사",
				"listName":"company-list",
				"formName":"company-form",
				"boardId":"2569258608",
				"columns":[
					{"data": "id", "title":"id"},
					{ "data": "name", "title":"고객사 이름" },
					{ "data": "address", "title":"주소" },
					{ "data": "tel", "title":"연락처" },
					{ "data": "userName", "title":"담당자" }
				]
			},
			"customer-list":{
				"title":"고객 리스트",
				"buttonTitle":"신규 고객",
				"listName":"customer-list",
				"formName":"customer-form",
				"boardId":"3231417172",
				"columns":[
					{ "data": "id", "title":"id"},
					{ "data": "name", "title":"고객 이름" },
					{ "data": "companyName", "title":"고객사" },
					{ "data": "hp", "title":"핸드폰" },
					{ "data": "email", "title":"이메일" },
					{ "data": "userName", "title":"담당자" }
				]
			},
			"user-list":{
				"title":"사용자 리스트",
				"buttonTitle":"신규 사용자",
				"listName":"user-list",
				"formName":"user-form",
				"columns":[
					{ "data": "_id", "title":"id"},
					{ "data": "username", "title":"email"},
					{ "data": "name", "title":"이름" },
					{ "data": "position", "title":"직급" },
					{ "data": "department", "title":"부서" },
					{ "data": "date", "title":"등록일" },
					{ "data": "degree", "title":"권한" }
				]
			},
			"notice-list":{
				"title":"공지사항 리스트",
				"buttonTitle":"새로운 공지사항",
				"listName":"notice-list",
				"formName":"notice-form",
				"columns":[
					{ "data": "id", "title":"id"},
					{ "data": "title", "title":"제목"},
					{ "data": "date", "title":"등록일" }
				]
			},
			"work-list":{
				"title":"할일 리스트",
				"buttonTitle":"새로운 할일",
				"listName":"work-list",
				"formName":"work-form",
				"columns":[
					{ "data": "id", "title":"id"},
					{ "data": "title", "title":"제목"},
					{ "data": "customer", "title":"고객" },
					{ "data": "company", "title":"고객사"},
					{ "data": "work", "title":"할일"},
					{ "data": "status", "title":"상태"},
					{ "data": "user", "title":"담당자"},
					{ "data": "duedate", "title":"날짜"}
				]
			},
			"sales-work-list":{
				"title":"영업일지 리스트",
				"buttonTitle":"영업일지 등록",
				"listName":"sales-work-list",
				"formName":"sales-work-form",
				"boardId":"871571433",
				"columns":[
					{ "data": "id", "title":"id"},
					{ "data": "name", "title":"제목"},
					{ "data": "customerName", "title":"고객" },
					{ "data": "companyName", "title":"고객사"},
					{ "data": "status", "title":"유형"},
					{ "data": "userName", "title":"담당자"},
					{ "data": "duedate", "title":"날짜"}
				]
			},
			"custom-board":{
				"buttonTitle":"새로운 글",
				"formName":"contents-container",
				"columns":[
					{ "data": "no", "title":"no"},
					{ "data": "id", "title":"id"},
					{ "data": "duedate", "title":"날짜" },
					{ "data": "productName", "title":"제품"},
					{ "data": "title", "title":"제목"},
					{ "data": "companyName", "title":"고객사"},
					{ "data": "customerName", "title":"고객"},
					{ "data": "contents", "title":"내용" }
				]
			}
		}
	}

}

 

const store = new Store();
