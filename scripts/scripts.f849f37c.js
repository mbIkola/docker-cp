"use strict";function int(a){return parseInt(a,10)}angular.module("dockerUiApp",["ngCookies","ngResource","ngSanitize","ngRoute","ui.bootstrap","ui.bootstrap.modal","route-segment","view-segment","chieffancypants.loadingBar","ui.bootstrap.pagination","ui.bootstrap.progressbar","base64","ui.bootstrap.alert","ui.bootstrap.typeahead","ui.bootstrap.datepicker","ui.select","ngTagsInput","gd.ui.jsonexplorer"]).config(["$routeProvider","$locationProvider","$routeSegmentProvider","cfpLoadingBarProvider",function(a,b,c,d){d.includeSpinner=!0,d.textSpinner="Wait...",b.hashPrefix("!"),c.options.autoLoadTemplates=!0,c.when("/","root").when("^/set/:key/:value*","root.set").when("/info","root.info").when("/events","root.events").when("/container/create","root.createContainer").when("/container/:containerId","root.container").when("/containers","root.containers").when("/images","root.images").when("/images/search","root.images-search").when("/image/:imageId","root.image").when("/hosts","root.hosts").when("/logout","root.logout").segment("root",{templateUrl:"views/main.html",controller:"MainCtrl",title:"Docker.io: Control Panel",resolve:{data:["$cookies","Docker",function(a,b){a.docker_host&&b.connectTo(a.docker_host)}]}}).within().segment("logout",{resolve:{data:["$rootScope","$cookies","$location",function(a,b,c){a.auth=b.auth="",c.path("/info")}]}}).segment("set",{resolve:{data:["$q","$route","Config","Docker",function(a,b,c,d){var e=a.defer(),f=b.current.params.key,g=b.current.params.value;return c[f]=g,d.version(function(a){e.resolve(a),d.connectTo(g)}),e.promise}]}}).segment("info",{templateUrl:"views/info.html",controller:"InfoCtrl",title:"Docker.io: Info","default":!0,resolve:{info:["$q","Docker",function(a,b){var c=a.defer();return a.all([b.info(),b.version()]).then(function(a){var b=a[0].data;b.version=a[1].data,c.resolve(b)},c.reject.bind(c)),c.promise}]}}).segment("event",{templateUrl:"views/event.html",controller:"EventCtrl",title:"Docker.io: Event"}).segment("events",{templateUrl:"views/events.html",controller:"EventsCtrl",title:"Docker.io: Events"}).segment("createContainer",{templateUrl:"views/create-container.html",controller:"CreateContainerCtrl",title:"Docker.io: Create Container"}).segment("container",{templateUrl:"views/container.html",controller:"ContainerCtrl",title:"Docker.io: Container",dependencies:["containerId"],resolve:{container:["$q","$route","Docker",function(a,b,c){var d=b.current.params.containerId,e=a.defer();return c.inspect({ID:d,errorHandler:!1},function(a,b){a?e.reject(a):e.resolve(b)}),e.promise}]},resolveFailed:{templateUrl:"404.html"}}).segment("containers",{templateUrl:"views/containers.html",controller:"ContainersCtrl",title:"Docker.io: Containers"}).segment("image",{templateUrl:"views/image.html",controller:"ImageCtrl",reloadOnSearch:!1,title:"Docker.io: Image",dependencies:["imageId"],resolve:{image:["$q","$route","Docker",function(a,b,c){var d=b.current.params.imageId,e=a.defer();return a.all([c.inspectImage({ID:d,errorHandler:!1}),c.images({all:!0,tree:!1}),c.historyImage({ID:d})]).then(function(a){var b=a[0].data;return 200!==a[0].status?e.reject(b):(b.info=a[1].data.find(function(a){return a.Id.substr(0,12)===d})||{},b.history=a[2].data||[],void e.resolve(b))},e.reject.bind(e)),e.promise}]},depends:["imageId"],resolveFailed:{templateUrl:"404.html"}}).segment("images",{templateUrl:"views/images.html",controller:"ImagesCtrl",title:"Docker.io: Images"}).segment("images-search",{templateUrl:"views/images-search.html",controller:"ImagesSearchCtrl",title:"Docker.io: Images Search"}).segment("hosts",{templateUrl:"views/hosts.html",controller:"HostsCtrl",title:"Docker.io: Hosts",resolve:{hosts:["Docker",function(a){return a.hosts()}]}}),a.otherwise({redirectTo:"/info"})}]),angular.module("dockerUiApp").config(["$httpProvider",function(a){a.interceptors.push(["$rootScope","Config",function(a,b){return{request:function(c){return c.headers=c.headers||{},c.headers["X-Registry-Auth"]&&(a.auth&&b.features.registryAuth?c.headers["X-Registry-Auth"]=a.auth.data:delete c.headers["X-Registry-Auth"]),c},requestError:function(b){return b.data?(a.alert.value={type:"warning",msg:b.data},b):b},responseError:function(b){return b.data?(a.alert.value={type:"warning",msg:b.data},b):b}}}])}]).controller("MainCtrl",["$scope","$log","$rootScope","$location","$cookies","$base64","cfpLoadingBar","Docker","Config",function(a,b,c,d,e,f,g,h,i){if(c.search=a.search={value:""},c.alert=a.alert={value:null},a.currentLocation=d.$$path.split("/").slice(0,2).join("/"),a.docker_host=c.docker_host||i.host,c.$watch("docker_host",function(b){b!==a.docker_host&&(a.docker_host=c.docker_host||i.host)}),c.$on("$routeChangeSuccess",function(b,c){a.currentLocation=c.$$route&&c.$$route.originalPath||d.$$path.split("/").slice(0,2).join("/"),g.status()&&g.complete()}),e.auth)try{a.auth=c.auth=JSON.parse(e.auth),a.auth.password=JSON.parse(f.decode(a.auth.data)).password,h.auth(a.auth,function(d){"Login Succeeded"!==d.Status&&(a.auth=c.auth=e.auth="",b.error("Auth error",d)),delete a.auth.password})}catch(j){b.error("Failed to parse cookies"),a.auth=c.auth=e.auth=""}a.authenticate=function(){h.authenticate(null,function(b,d){b||(d.data=f.encode(JSON.stringify(d)),delete d.password,a.auth=c.auth=d,e.auth=JSON.stringify(d))})}}]),angular.module("dockerUiApp").controller("ContainersCtrl",["$scope","$location","Docker",function(a,b,c){a.containers=[],a.containerOpts={colDef:[{name:"Id",field:"Id",map:function(a){return a.slice(0,12)},link:"/container/{{Id | shortTag}}"},{name:"Name",field:"Names",map:function(a){return a.map(function(a){return a.slice(1)}).join(",")},link:"/container/{{ Id | shortTag }}"},{name:"Image",field:"Image"},{name:"Size",field:"SizeRw",filter:{name:"calcMem"}},{name:"Status",field:"Status"},{name:"Created",field:"Created",map:function(a){return new Date(1e3*a)},filter:{name:"date",options:"mediumDate"}}],rowClass:function(a){return{success:a.Status&&!/^Exit/g.test(a.Status)}},sortBy:"Status",globalFilter:!0},a.options={size:!0,all:!0},a.reload=function(){c.containers(a.options,function(b){a.containers=b})},a.createContainer=function(){c.createContainer({},function(a){a&&b.path("/container/"+a.Id.slice(0,12))})},a.reload()}]),angular.module("dockerUiApp").controller("ImagesCtrl",["$scope","$location","Docker",function(a,b,c){function d(a,b){var c={},d=b||[],e={};return a.forEach(function(a){c[a.Id]=a,e[a.Id]=e[a.Id]||[],a.children=e[a.Id],a.ParentId?e[a.ParentId]?e[a.ParentId].push(a):e[a.ParentId]=[a]:d.push(a)}),d}a.images=[],a.options={all:!1,tree:!1},a.reload=function(){c.images(a.options,function(b){a.images.splice(0),a.images=a.options.tree?d(b):b})},a.imagesOpts={colDef:[{name:"Id",field:"Id",map:function(a){return a.slice(0,12)},link:"/image/{{ Id | shortTag }}"},{name:"Name",field:"RepoTags",link:"/image/{{ Id | shortTag }}",map:function(a){return a[0].split(":")[0]}},{name:"Tags",field:"RepoTags",map:function(a){return a.map(function(a){return a.split(":")[1]}).filter(function(a){return!!a}).join(", ")}},{name:"Size",field:"Size",filter:"calcMem"},{name:"Virtual Size",field:"VirtualSize",filter:"calcMem"},{name:"Created",field:"Created",map:function(a){return new Date(1e3*a)},filter:{name:"date"}}],nested:!0,globalFilter:!0},a.searchImages=function(){b.path("/images/search")},a.reload()}]),angular.module("dockerUiApp").controller("EventsCtrl",["$scope","Docker",function(a,b){a.events=[],a.since=new Date,a.stream=null,a.getEvents=function(){a.stream&&(a.stream.abort(),a.events=[]);var c=new Date(a.since.getTime());c.setUTCHours(0),c.setUTCMinutes(0),c.setUTCSeconds(0),a.stream=b.events("since="+(c.getTime()/1e3>>>0),function(b){b.forEach(function(b){a.events.unshift(b)}),a.$apply()},angular.noop)},a.$on("$destroy",function(){a.stream&&(a.stream.abort(),a.stream=null),a.events=[]}),a.eventsOpts={colDef:[{name:"Id",field:"id",filter:"shortTag"},{name:"Event",field:"status"},{name:"From",field:"from"},{name:"Time",field:"time",map:function(a){return new Date(1e3*a)},filter:{name:"date",options:"medium"}}],globalFilter:!0},a.sinceOpts={max:(new Date).getTime(),"show-button-bar":!1,showWeeks:!1,startingDay:1},a.getEvents()}]),angular.module("dockerUiApp").controller("HostsCtrl",["$rootScope","$scope","Docker","hosts",function(a,b,c,d){function e(a){var b,c=[];for(b in a)a.hasOwnProperty(b)&&c.unshift({url:b,created:a[b].created,lastConnected:a[b].lastConnected});return c}b.hosts=e(d),b.connectTo="",b.connect=function(d){d=d||b.connectTo,d&&c.connectTo(d,function(b){b&&(a.alert.value={msg:b.message,level:"error"})})},b.hostsOpts={colDef:[{name:"URL",field:"url"},{name:"last connected",field:"lastConnected",filter:{name:"date",options:"mediumDate"}},{name:"Created",field:"created",filter:{name:"date",options:"mediumDate"}},{name:"Actions",buttons:[{name:'<i class="glyphicon glyphicon-open"></i> Connect',"class":"btn btn-xs btn-primary",click:function(a){b.connect(a.url)}}],compile:!0}],globalFilter:!0}}]),angular.module("dockerUiApp").service("http",["$http",function(a){function b(a,b){return a.replace(/(\/:[^\/]+)/g,function(a,c){var d,e=c.substr(2);return b.hasOwnProperty(e)?(d=b[e],delete b[e],"/"+d):""})}function c(a,b){var c,d,e,f,g={},h=Object.getOwnPropertyNames(a),i=h.length;for(c=0;i>c;c+=1)d=h[c],e=a[d],f=e,"@"===e[0]?f=b[e.substr(1)]:"="===e[0]&&(e=d,f=b[e]),void 0!==f&&(g[d]=f);return g}function d(d){return function(e,f,h){function i(a){return function(){var b=[].slice.call(arguments);if(angular.isFunction(m)){if("error"===a)return void m.apply(null,b)}else{if("error"===a)return void h.apply(this,b);b.unshift(null)}h.apply(this,b)}}h||(h=f,f=e),h||(h=f,f=e),h||(h=angular.noop),e=e||{};var j,k,l,m=e.hasOwnProperty("errorHandler")?e.errorHandler:g.errorHandler;return delete e.errorHandler,e=c(angular.extend({},d.params),e),j=b(g.url(),e),k={method:d.method,url:j,params:e},d.target&&"self"===d.target?void(location.href=k.url):("POST"===d.method&&(k.data=f),d.withCredentials&&(k.withCredentials=!0),d.responseType&&(k.responseType=d.responseType),d.timeout&&(k.timeout=d.timeout),d.headers&&(k.headers=d.headers),d.transformRequest&&(k.transformRequest=d.transformRequest),l=a(k),angular.isFunction(h)&&l.success(function(a,b){b=!b||b>400?"error":"success",a||(a="Connection refused"),i(b)(a)}).error(i("error")),l)}}function e(a,b){b=b||{};var c;for(c in a)a.hasOwnProperty(c)&&(b[c]=d(a[c]));return b}function f(a,b,c,d){angular.extend(g,{url:a});var f,h,i,j=new FormData,k={path:b,files:{}};for(f=0;f<c.length;f+=1)h=c[f],k.files[h.name]=h.size;for(j.append("metadata",JSON.stringify(k)),f=0;f<c.length;f+=1)j.append("uploadInput",c[f]);i=e({uploadFile:{method:"POST",data:j,transformRequest:angular.identity,headers:{"Content-Type":void 0},params:{}}}),i.uploadFile({},j,d)}var g={url:"",errorHandler:null};return{createMethod:d,config:function(a){angular.extend(g,a)},createService:e,uploadFiles:f}}]),angular.module("dockerUiApp").service("Docker",["$rootScope","$q","$filter","$cookies","$location","http","$http","stream","$modal","Config",function(a,b,c,d,e,f,g,h,i,j){function k(){return this instanceof k?this.servers[j.host]?this.servers[j.host]:(this.servers[j.host]=this,this):new k}function l(a,b){var c=this;i.open({templateUrl:"views/auth.html",resolve:{auth:function(){return a||{}}},controller:["$scope","$modalInstance",function(d,e){d.auth=a||{},d.login=function(){c.auth(d.auth,function(a){"Login Succeeded"===a.Status?b(null,d.auth):b(new Error(a))}),e.close()},d.close=function(){e.close(),b(!1)}}]})}return k.prototype.servers={},k.prototype.client=function(){return this.servers[j.host]},f.config({url:function(){return j.host+"/:service/:p1/:p2"},errorHandler:function(b){a.alert.value={type:"error",msg:b}}}),f.createService({containers:{method:"GET",params:{service:"containers",p1:"json",size:"=",all:"="}},inspect:{method:"GET",params:{service:"containers",p1:"@ID",p2:"json"}},processList:{method:"GET",cache:!1,params:{service:"containers",p1:"@ID",p2:"top",ps_args:"="}},create:{method:"POST",params:{service:"containers",p1:"create",name:"="}},changes:{method:"GET",params:{service:"containers",p1:"@ID",p2:"changes"}},start:{method:"POST",params:{service:"containers",p1:"@ID",p2:"start"}},stop:{method:"POST",params:{service:"containers",p1:"@ID",p2:"stop"}},restart:{method:"POST",params:{service:"containers",p1:"@ID",p2:"restart"}},kill:{method:"POST",params:{service:"containers",p1:"@ID",p2:"kill"}},_destroy:{method:"DELETE",params:{service:"containers",p1:"@ID"}},_commit:{method:"POST",params:{service:"commit",container:"=",repo:"=",tag:"=",m:"=",author:"=",run:"="}},"export":{method:"GET",target:"self",params:{service:"containers",p1:"@ID",p2:"export"}},images:{method:"GET",params:{service:"images",p1:"json",all:"="}},insertToImage:{method:"POST",params:{service:"images",p1:"@ID",insert:"insert",path:"=",url:"="}},inspectImage:{method:"GET",params:{service:"images",p1:"@ID",p2:"json"}},historyImage:{method:"GET",params:{service:"images",p1:"@ID",p2:"history"}},deleteImage:{method:"DELETE",params:{service:"images",p1:"@ID"}},searchImage:{method:"GET",params:{service:"images",p1:"search",term:"="}},pushImage:{method:"POST",headers:{"X-Registry-Auth":"="},params:{service:"images",p1:"@Name",p2:"push",tag:"="}},info:{method:"GET",params:{service:"info"}},version:{method:"GET",params:{service:"version"}},auth:{method:"POST",params:{service:"auth"},error:!0},ping:{method:"GET",params:{service:"ping"}}},k.prototype),k.prototype.createContainer=function(a,d){var e=this,f={Image:"",PortSpecs:[],ExposedPorts:[],Env:[],Dns:["8.8.8.8","8.8.4.4"],Tty:!0,AttachStdin:!0,AttachStdout:!0,AttachStderr:!0,OpenStdin:!0,StdinOnce:!0,Volumes:[],VolumesFrom:[]},g=angular.extend({},f,a);i.open({templateUrl:"views/create-container.html",resolve:{input:function(){return g}},controller:["$scope","$modalInstance","input",function(a,f,g){function h(a){return(a||[]).map(function(a){return a.text}).filter(function(a){return!!a})}function i(a,b){return c("filter")(a,b)}a.input=g,a.images=[],a.containers=[],a.getImages=function(c){var d=b.defer(),f=d.promise;return a.images.length?d.resolve(i(a.images,c)):f=e.images(function(b){return a.images=b.map(function(a){return a.RepoTags.slice(-1)[0]}),i(a.images,c)}),f},a.getContainer=function(c){var d=b.defer(),f=d.promise;return a.containers.length?d.resolve(i(a.containers,c)):f=e.containers({all:!0},function(b){return a.containers=b.map(function(a){return a.Names[0].substr(1)}),i(a.containers,c)}),f},a.ok=function(){var b={},c=[],g=angular.extend({},a.input);g.Cmd=g.Cmd||"",g.Cmd=(g.Cmd.match(/(?:[^\s"]+|"[^"]*")+/g)||[]).map(function(a){var b=a.substr(0,1),c=a.substr(-1);return('"'===b&&'"'===c&&b===c||"'"===b&&"'"===c&&b===c)&&(a=a.slice(1,-1)),a}),["Env","Dns","ExposedPorts","PortSpecs","Volumes","Links"].forEach(function(a){Array.isArray(g[a])&&(g[a]=h(g[a]))}),g.VolumesFrom.length||delete g.VolumesFrom,g.Volumes.length?(g.Volumes.forEach(function(a){var d=a.split(":");b[d[1]]={},c.push(a)}),g.Volumes=b):delete g.Volumes,e.create(g,function(a){f.close(),e.start({ID:a.Id,Links:g.Links,LxcConf:g.LxcConf,Dns:g.Dns,VolumesFrom:g.VolumesFrom,Binds:c},function(){d(a)})})},a.close=function(){f.close(),d(!1)}}]})},k.prototype.destroy=function(a,b){var c=this;i.open({templateUrl:"views/destroy-container.html",resolve:{instance:function(){return a}},controller:["$scope","$modalInstance",function(d,e){d.instance=a,d.ok=function(){c._destroy({ID:a.ID.slice(0,12),v:d.removeAll},function(){e.close(),b(!0)})},d.close=function(){e.close(),b(!1)}}]})},k.prototype.commit=function(a,b){var c=this;i.open({templateUrl:"views/commit-container.html",resolve:{instance:function(){return a}},controller:["$scope","$modalInstance",function(d,e){d.instance=a,d.input={repo:a.Name.substr(1),container:a.ID.slice(0,12)},d.ok=function(){c._commit(d.input,function(a){b(a),e.close()})},d.close=function(){e.close(),b(!1)}}]})},k.prototype.createImage=function(a,b){var c={url:j.host+"/images/create?"+(a.query||""),method:a.method||"POST",headers:{"X-Registry-Auth":"="},parseStream:!0,progressHandler:a.progressHandler},d=h.request(c);return d.then(b),d},k.prototype.pushImage=function(a,b){var c={url:j.host+"/images/"+a.name+"/push?"+(a.query||""),method:a.method||"POST",headers:{},parseStream:!0,progressHandler:a.progressHandler},d=h.request(c);return d.then(b),d},k.prototype.events=function(a,b,c){var d={url:j.host+"/events?"+a||"since=1",method:"GET",parseStream:!0,progressHandler:b},e=h.request(d);return e.then(c),e},k.prototype.logs=function(a,b,c){var d=[];["stderr","stdout","tail"].forEach(function(b){a[b]&&d.push(b+"="+a[b])}),d.push("timestamps=0&follow=1");var e={url:j.host+"/containers/"+a.ID+"/logs?"+d.join("&"),method:"GET",parseStream:!1,progressHandler:b},f=h.request(e);return f.then(c),f},k.prototype.authenticate=function(a,b){var c=this;a?c.auth(a,function(){l.call(c,a,b)}):l.call(c,a,b)},k.prototype.getImageTags=function(a){return g.get("https://jsonp.nodejitsu.com/?url="+encodeURIComponent("https://index.docker.io/v1/repositories/"+a+"/tags"))},k.prototype.hosts=function(){var a={};try{a=JSON.parse(d.docker_hosts)}catch(b){}return a},k.prototype.connectTo=function(b,c){c=c||angular.noop;var f=this,h=document.createElement("a");h.href=b,b=h.protocol+"//"+h.host,g.get(b+"/_ping").then(function(g){if("OK"!==g.data)return c(new Error('Failed to connect to host "'+b+'"'));a.docker_host=j.host=d.docker_host=b;var h=f.hosts(),i=h[b];i?(delete h[b],i.lastConnected=(new Date).getTime(),h[b]=i):h[b]={created:(new Date).getTime(),lastConnected:(new Date).getTime()};var k=Object.getOwnPropertyNames(h),l=k.length;Object.keys(h).splice(0,l-j.hostsHistoryLength).forEach(function(a){delete h[a]}),d.docker_hosts=JSON.stringify(h),e.url("/info"),c(null,h)})},new k}]),angular.module("dockerUiApp").value("Config",{host:"http://localhost:4243",hostsHistoryLength:10,features:{registryAuth:!1}}),angular.module("dockerUiApp").directive("ngAppendHtml",["$compile",function(a){return function(b,c,d){c.append(a(angular.element(b.$eval(d.ngAppendHtml)))(b))}}]),angular.module("dockerUiApp").directive("dcGrid",["$compile","$parse","$rootScope","$filter",function(a,b,c,d){return{template:'<div>                <div class="row">                    <div class="col-sm-2">                        <pager total-items="totalItems" items-per-page="maxSize" page="currentPage" num-pages="numPages"></pager>                    </div>                    <div class="pager col-sm-1 center-block" style="padding-top: 6px;">                        Page: {{ currentPage }} / {{ numPages }}                    </div>                </div>                <table class="table table-hover">                    <thead>                        <tr>                            <th data-ng-repeat="def in options.colDef" data-ng-click="sort(def.field)" style="cursor: pointer;">                                <i data-ng-class=\'{"glyphicon-chevron-up": sortUp(def.field), "glyphicon-chevron-down": sortDown(def.field)}\' class="glyphicon"></i>{{ def.name }}                            </th>                        </tr>                    </thead>                    <tbody>                        <tr data-ng-repeat-start="row in rows"                             data-ng-class="rowClass(row)"                             data-ng-click="subgrid(row)"                             style="min-width: 50px;">                            <td data-ng-repeat="def in options.colDef"                                 data-ng-append-html="get(row, def)"                                 data-ng-compile="def.compile"                                 style="{{def.style}}"                                 data-ng-class="def.class"></td>                        </tr>                        <tr data-ng-repeat-end data-ng-show="nested && row.Id === active" data-name="parent-{{ row.Id }}">                            <td colspan="{{ options.colDef.length }}">                                <span style="padding-left: 40px"></span>                            </td>                        </tr>                    </tbody>                </table>            </div>',restrict:"E",replace:!0,scope:{options:"=",items:"="},link:function(e){function f(a){a.length&&(e.totalItems=a.length,e.sortBy&&e.sortType&&(a=d("orderBy")(a,e.sortBy,e.sortType)),e.rows=a.slice((e.currentPage-1)*e.maxSize,e.currentPage*e.maxSize),h=!1)}e.currentPage=1,e.maxSize=e.options.maxSize||10,e.nested=!!e.options.nested,e.active=null;var g=[],h=!1;e.$watchCollection("items",function(a){h=!0,e.currentPage=1,g=a||[],f(g)}),e.$watch("currentPage",function(){h||f(g)}),e.sortBy=e.options.sortBy,e.sortType=!!e.options.sortBy,e.sort=function(a){e.sortBy!==a?(e.sortBy=a,e.sortType=!0):e.sortType?e.sortType=!1:(e.sortType=null,e.sortBy=null),f(g)},e.sortUp=function(a){return e.sortBy===a&&e.sortType===!0},e.sortDown=function(a){return e.sortBy===a&&e.sortType===!1},e.options.globalFilter&&c.$watch("search.value",function(a){h||(g=d("filter")(e.items,a),f(g))}),e.rowClass=function(a){return e.options.rowClass?e.options.rowClass(a):""},e.subgrid=function(b){if(e.nested){if(!b.children||!b.children.length||e.active===b.Id)return void(e.active=null);e.active=b.Id;var c=e.$new();c.options=e.options,c.items=b.children,angular.element("[data-name=parent-"+b.Id+"] span").html("").append(a('<dc-grid data-options="options" data-items="items"></dc-grid>')(c))}},e.get=function(c,f){var g=b(f.field),h=g(e,c),i=null;return c.$watch=function(a,b){b(a(c),null)},Array.isArray(f.buttons)?(i="",f.buttons.forEach(function(a,b){i+='<button class="btn '+a.class+'" data-ng-click="def.buttons['+b+'].click(row)">'+a.name+"</button>"}),i):("function"==typeof f.map?h=f.map(h,c):"string"==typeof f.map&&(i=angular.element("<div>"+f.map+"</div>"),h=a(i)(c).html()),f.filter&&(h="string"==typeof f.filter?d(f.filter)(h):d(f.filter.name)(h,f.filter.options)),f.link?(i=angular.element('<div><a href="#!'+f.link+'">'+h+"</a></div>"),i=a(i)(c).html()):i=h,void 0===i&&(i=""),"<span>"+i+"</span>")}}}}]),angular.module("dockerUiApp").controller("ContainerCtrl",["$scope","$routeSegment","$timeout","$location","Config","Docker","container",function(a,b,c,d,e,f,g){function h(){b.chain.slice(-1)[0].reload()}function i(){a.active&&(1!==a.Console.socket.readyState?(delete a.Console.socket,a.attachConsole()):c(i,1e3))}function j(){a.active=!1,a.activeTab={},a.Console.logs.connection&&a.Console.logs.connection.abort(),a.Console.logs.terminal&&(a.Console.logs.terminal.destroy(),a.Console.logs.terminal=!1),a.Console.socket&&a.Console.socket.close(),a.Console.terminal&&a.Console.terminal.destroy()}a.active=!0,a.container=g,a.containerId=g.Id.slice(0,12),a.changes=[],a.Console={logs:{terminal:null,connection:null}},a.changesOpts={colDef:[{name:"Filename",field:"Path"}],rowClass:function(a){return{warning:!!a.Kind}},maxSize:5},a.activeTab={},a.processList=function(b){a.containerId&&a.container.State.Running&&f.processList({ID:a.containerId,ps_args:"axwuu"},function(b){a.processList=b}),a.activeTab[b]&&a.active&&c(a.processList.bind(a,b),2e3)},a.logs=function(){var b=angular.element("#logTerminal")[0];if((b&&a.containerId||a.Console.logs.terminal)&&!a.Console.logs.terminal){var c=a.Console.logs.terminal=new Terminal({cols:0,rows:0,useStyle:!0,screenKeys:!0,cursorBlink:!1});c.open(b);var d=a.Console.logs.connection=f.logs({ID:a.containerId,stdout:1,stderr:1,tail:100},function(e){b?e.split("\n").forEach(function(a){c.write(a+"\r\n")}):(d.abort(),c.destroy(),a.Console.logs.terminal=!1)})}},a.start=function(){a.containerId&&f.start({ID:a.containerId},h)},a.stop=function(){a.containerId&&f.stop({ID:a.containerId},h)},a.restart=function(){a.containerId&&f.restart({ID:a.containerId},h)},a.kill=function(){a.containerId&&f.kill({ID:a.containerId},h)},a.destroy=function(){a.containerId&&f.destroy({ID:a.containerId},function(a){a&&d.path("/containers")})},a.commit=function(){a.containerId&&f.commit(a.container,function(a){a&&d.path("/image/"+a.Id.slice(0,12))})},a.attachConsole=function(){if(a.containerId&&!a.Console.socket){var b=document.createElement("a");b.href=e.host,a.Console.socket=new WebSocket(("https:"===b.protocol?"wss":"ws")+"://"+b.host+"/containers/"+a.containerId+"/attach/ws?logs=0&stream=1&stdout=1&stderr=1&stdin=1"),a.Console.terminal=new Terminal({cols:0,rows:0,useStyle:!0,screenKeys:!0}),a.Console.socket.onopen=function(){i()},a.Console.socket.onmessage=function(b){a.Console.terminal.write(b.data)},a.Console.socket.onclose=function(){a.Console.terminal.destroy()},a.Console.terminal.on("data",function(b){a.Console.socket.send(b)}),angular.element("#terminal").html(""),a.Console.terminal.open(angular.element("#terminal")[0])}},a.getChanges=function(){f.changes({ID:a.containerId},function(b){a.changes=b})},a.createAs=function(){f.createContainer(a.container.Config,function(a){a&&d.path("/container/"+a.Id.slice(0,12))})},a.export=function(){f.export({ID:a.containerId})},a.$on("$destroy",j),a.$on("$routeChangeSuccess",function(){b.chain.slice(-1)[0].reload()})}]),angular.module("dockerUiApp").filter("calcMem",function(){return function(a,b){var c,d=parseInt(a,10)||0,e=["bytes","Mb","Gb","Tb","Pb"];for(b=b||"bytes",d||(d=0),b||(b="bytes"),c=e.indexOf(b),c=c>=0?c:0;c<e.length;c+=1)if(c){if(!(d>1024))break;d/=1024,b=e[c-1]}return d.toFixed(2)+(d?b:"")}}),angular.module("dockerUiApp").controller("ImageCtrl",["$scope","$routeSegment","$location","Docker","image",function(a,b,c,d,e){a.image=e,a.destroyImage=function(){d.deleteImage({ID:e.Id.slice(0,12)},function(){c.path("/images")})},a.imageHistoryOpts={colDef:[{name:"Id",field:"Id",filter:"shortTag",link:"/image/{{ Id | shortTag }}"},{name:"Created By",field:"CreatedBy",style:"max-width: 500px;white-space: nowrap; overflow: hidden; text-overflow: ellipsis;",map:function(){return"<span>{{ row.CreatedBy || '' }}</span>"}},{name:"Date",field:"Created",map:function(a){return new Date(1e3*a)},filter:"date"},{name:"Size",field:"Size",filter:"calcMem"}],maxSize:5},a.$on("$routeChangeSuccess",function(){b.chain.slice(-1)[0].reload()})}]),angular.module("dockerUiApp").controller("ImagesSearchCtrl",["$scope","$modal","Docker",function(a,b,c){function d(a,b,c){return'<i class="glyphicon glyphicon-star'+(a?"":"-empty")+'"'+(void 0!==c?' title="'+c+'"':"")+"></i>"}function e(b){var c=Math.round(a.maxRate?b/a.maxRate*5:0);return[1,2,3,4,5].map(function(a,e){return d(c&&c>=e,void 0,b)}).join("")}function f(a){var b;for(b in a)if(a.hasOwnProperty(b))return!1;return!0}a.images=[],a.imageSearch="",a.maxRate=0,a.doSearch=function(){c.searchImage({term:a.imageSearch},function(b){b.forEach(function(b){a.maxRate=a.maxRate>=b.star_count?a.maxRate:b.star_count}),a.images=b})},a.selectImageTag=function(a,d){c.getImageTags(a.name).then(function(c){b.open({templateUrl:"views/image-version-choice.html",controller:["$scope","$modalInstance",function(b,e){b.image=a,b.tags=c.data,b.selected={tag:"latest"},b.ok=function(){e.close(),d(null,b.selected.tag)},b.cancel=function(){e.close(),d("canceled")}}]})})},a.downloadImage=function(d,e){e=e||"latest",a.progress={},b.open({templateUrl:"views/download-image.html",keyboard:!1,backdrop:"static",resolve:{image:function(){return d},progress:function(){return a.progress}},controller:["$scope","$modalInstance","image","progress",function(a,b,c,d){a.image=c,a.progress=d,a.tag=e,a.background=function(){b.close()}}]}),c.createImage({query:"fromImage="+d.name+"&tag="+e,progressHandler:function(b){Array.isArray(b)&&(b.forEach(function(b){if(!b.id)return void(d.statusMessage=b.status);var c=a.progress[b.id]||{active:!0,total:0,k:0};a.progress[b.id]=c,f(b.progressDetail)||(c.start=c.start||new Date(1e3*b.progressDetail.start),c.total=b.progressDetail.total,c.current=b.progressDetail.current,c.k=100*c.current/c.total),"Download complete"===b.status&&(c.k=100,c.current=c.total,c.active=!1),c.status=b.status}),a.$apply())}},function(){console.warn("Download complete?",arguments)})},a.imagesOpts={colDef:[{name:"Name",field:"name"},{name:"Trusted",field:"is_trusted",map:d},{name:"Official",field:"is_official",map:d},{name:"Rating",field:"star_count",map:e},{name:"Description",field:"description",style:"max-width: 500px;white-space: nowrap; overflow: hidden; text-overflow: ellipsis;",map:function(){return'<span data-popover="{{ row.description }}" data-popover-trigger="mouseenter">{{ row.description }}</span>'}},{name:"Actions",buttons:[{name:'<i class="glyphicon glyphicon-download"></i> Download',"class":"btn btn-xs btn-primary",click:function(b){a.selectImageTag(b,function(c,d){c||a.downloadImage(b,d.name)})}}],compile:!0}],globalFilter:!0}}]);var lowercase=function(a){return angular.isString(a)?a.toLowerCase():a},msie=int((/msie (\d+)/.exec(lowercase(navigator.userAgent))||[])[1]);isNaN(msie)&&(msie=int((/trident\/.*; rv:(\d+)/.exec(lowercase(navigator.userAgent))||[])[1]));var XHR=window.XMLHttpRequest||function(){try{return new ActiveXObject("Msxml2.XMLHTTP.6.0")}catch(a){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0")}catch(a){}try{return new ActiveXObject("Msxml2.XMLHTTP")}catch(a){}throw new Error("This browser does not support XMLHttpRequest.")};angular.module("dockerUiApp").factory("stream",["$log","$q","$timeout","$rootScope","Config",function(a,b,c,d,e){function f(f){function h(){function a(a){try{return angular.fromJson(a)}catch(b){return void 0}}function b(a,b,c){var d=a.substring(c||0).search(b);return d>=0?d+(c||0):d}for(var c,d,e,f=[];~(c=b(l.response,/}\s*{/,n))&&(d=l.response.slice(n,c+1),e=a(d),void 0!==e);)f.push(e),n=c+1;return d=l.response.slice(n),e=a(d),void 0!==e&&(f.push(e),n=l.response.length),f}function i(){j=g,l&&l.abort()}var j,k=b.defer(),l=this.xhr=new XHR,m=f.headers||{},n=0;return m["X-Registry-Auth"]&&(d.auth&&e.features.registryAuth?m["X-Registry-Auth"]=d.auth.data:delete m["X-Registry-Auth"]),l.open(f.method,f.url,!0),angular.forEach(m,function(a,b){angular.isDefined(a)&&l.setRequestHeader(b,a)}),l.onreadystatechange=function(){if(4===l.readyState){var a=null,b=null;j!==g&&(a=l.getAllResponseHeaders(),b=l.responseType?l.response:l.responseText),k.resolve(j||l.status,b,a)}},angular.isFunction(f.progressHandler)&&(l.onprogress=function(){(2===l.readyState||3===l.readyState||4===l.readyState)&&(3!==l.readyState||200===l.status)&&(f.parseStream?f.progressHandler(h()):(f.progressHandler(l.response.slice(n)),n=l.response.length))}),l.onerror=function(b){a.error(b)},f.withCredentials&&(l.withCredentials=!0),f.responseType&&(l.responseType=f.responseType),l.send(f.post||null),f.timeout>0&&c(i,f.timeout),k.promise.abort=function(){l&&l.abort()},k.promise}var g=-1;return{request:function(a){return new f(a)}}}]),angular.module("dockerUiApp").controller("InfoCtrl",["$scope","Config","info",function(a,b,c){a.info=c,a.version=c.version,a.Config=b}]),angular.module("dockerUiApp").filter("shortTag",function(){return function(a){return a&&a.slice(0,12)}});