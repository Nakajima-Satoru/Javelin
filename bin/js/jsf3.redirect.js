
jsf3.redirect={

    /**
     * next
     * @param {*} pageName 
     * @param {*} option 
     * @returns 
     */
    next:function(pageNameFull,option){

        if(!option){
            option={};
        }

        var _pbuff=this._getAregment(pageNameFull);

        var pageName=_pbuff.pageName;
        var aregment=_pbuff.aregment;

        var now=jsf3.buffer.nowPage;

        if(now && now.pageNameFull == pageNameFull){
             return;
        }

        jsf3.locking.link=true;

        history.pushState(pageName, null, null);

        if(jsf3.cache.pages[pageName]==undefined && jsf3.cache.page[pageName]==undefined){        
            jsf3.locking.link=false;
            throw new Error("The redirected page or method information cannot be found.\""+pageName+"\"");
        }

        var _content="";
        if(jsf3.cache.pages[pageName]){
            _content=jsf3.base64.decode(jsf3.cache.pages[pageName]);
        }

        var _pageData={};
        if(jsf3.cache.page[pageName]){
            _pageData=jsf3.cache.page[pageName];
        }

        var _next={
            id:jsf3.uniqId(),
            pageNameFull:pageNameFull,
            pageName:pageName,
            option:option,
            aregment:aregment,
        };

        var pageArea=$("pagearea");

        if(_content){

            var nextPage='<page id="'+_next.id+'"><wk>'+_content+'</wk></page>';
            pageArea.append(nextPage);
            var nextPageObj=pageArea.find("#"+_next.id);
            if(_pageData.class){
                nextPageObj.addClass(_pageData.class);
            }
            
            jsf3.buffer.nowPage=_next;
        }

        var callObj={
            mode:"next",
            _waited:false,
            nowPage:now,
            nextPage:_next,
            aregment:aregment,
            wait:function(){
                this._waited=true;
            },
            exit:function(){
                if(nextPageObj){
                    nextPageObj.remove();
                }
                callObj._waited=true;        
                jsf3.locking.link=false;
            },
        };

        if(nextPageObj){
            callObj.pageObj=nextPageObj;
        }

        jsf3.sync([

            function(next){

                /** set wait function */
                callObj.next=function(){
                    callObj._waited=false;
                    next();
                };
                next();
            },

            function(next){

                /** group before / beforeNext */
                if(!_pageData.group){
                    next();
                    return;
                }

                if(typeof _pageData.group=="string"){
                    _pageData.group=[_pageData.group];
                }

                var groupCallbackList=[];

                var callObj2={
                    mode:"next",
                    _waited:false,
                    nowPage:callObj.now,
                    nextPage:callObj.next,
                    aregment:aregment,
                    wait:function(){
                        callObj2._waited=true;
                    },
                    exit:function(){
                        if(nextPageObj){                                
                            nextPageObj.remove();
                        }
                        callObj2._waited=true;        
                        jsf3.locking.link=false;
                    },
                };

                groupCallbackList.push(function(next2){
                    callObj2.next=function(){
                        callObj2._waited=false;
                        next2();
                    };
                    next2();
                });

                for(var n=0;n<_pageData.group.length;n++){

                    var groupName=_pageData.group[n];
                    var _g=jsf3.cache.group[groupName];

                    if(_g){
                        if(_g.before){
                            var _callback=_g.before;

                            groupCallbackList.push(function(next2){   
                                _callback(callObj2);
                                if(!callObj2._waited){
                                    next2();
                                }
                            });
                        }
                        if(_g.beforeNext){
                            var _callback=_g.beforeNext;

                            groupCallbackList.push(function(next2){   
                                _callback(callObj2);
                                if(!callObj2._waited){
                                    next2();
                                }
                            });
                        }
                    }
                   
                }

                groupCallbackList.push(function(){
                    next();
                });

                jsf3.sync(groupCallbackList);

            },

            function(next){

                /** before */
                if(!_pageData.before){
                    next();
                    return;
                }
                
                var callback=_pageData.before;
                callback(callObj);
                if(!callObj._waited){
                    next();
                }

            },

            function(next){

                /** beforNext */
                if(!_pageData.beforeNext){
                    next();
                    return;
                }
                
                var callback=_pageData.beforeNext;
                callback(callObj);
                if(!callObj._waited){
                    next();
                }

            },

            function(next){

                /** option before */
                if(!option.callback){
                    next();
                    return;
                }

                if(!option.callback.before){
                    next();
                    return;
                }

                option.callback.before(callObj);

                if(!callObj._waited){
                    next();
                }
            },

            function(next){

                /** page tag class move */

                var pageOpen=function(){

                    if(_content){

                        if(jsf3.buffer.pageMoveIndex<(jsf3.buffer.pages.length-1)){
                            for(var n=jsf3.buffer.pageMoveIndex;n<jsf3.buffer.pages.length;n++){
                                delete jsf3.buffer.pages[n];
                            }
                            jsf3.buffer.pages.sort();
                        }
            
                        if(now){
                            if(jsf3.buffer.pages[jsf3.buffer.pageMoveIndex-1]){
                                jsf3.buffer.pages[jsf3.buffer.pageMoveIndex-1].content=pageArea.find("#"+now.id).html();
                            }
                        }
            
                        if(option.bufferClear){
                            jsf3.redirect.clear();
                        }
            
                        jsf3.buffer.pages[jsf3.buffer.pageMoveIndex]=_next;
                        jsf3.buffer.pageMoveIndex++;  

                        if(jsf3.option.animation){
                            pageArea.addClass("open");
                            if(option.animation!=undefined){
                                var __beforeAnimation=pageArea.attr("class");
                                pageArea.removeClass(__beforeAnimation).addClass(option.animation);
                            }
                        }

                        if(now){
                            pageArea.find("page#"+now.id).removeClass("open").addClass("closed"); 
                        }
            
                        var nowPageArea=pageArea.find("page#"+_next.id);
                        nowPageArea.addClass("open");    
                    }
                };

                var pageClose=function(){
                    if(now && _content && !option.leavePage){
                        pageArea.find("page#"+now.id).remove();
                    }
                };
               

                if(jsf3.option.animation){
                    pageOpen();
                    setTimeout(function(){
                        pageClose();                        
                        setTimeout(function(){   
                            
                            if(option.animation){
                                pageArea.addClass(__beforeAnimation).removeClass(option.animation);
                            }               
                            
                            pageArea.removeClass("open");
                            next();
                        },500);
                    },500);
                }
                else{
                    pageOpen();  
                    pageClose();
                    next();
                }

            },

            function(next){

                /** group after / afterNext */
                if(!_pageData.group){
                    next();
                    return;
                }

                var groupCallbackList=[];

                var callObj2={
                    mode:"next",
                    _waited:false,
                    nowPage:callObj.now,
                    nextPage:callObj.next,
                    wait:function(){
                        callObj2._waited=true;
                    },
                    exit:function(){
                        callObj2._waited=true;        
                        jsf3.locking.link=false;
                    },
                };

                groupCallbackList.push(function(next2){
                    callObj2.next=function(){
                        callObj2._waited=false;
                        next2();
                    };
                    next2();
                });

                for(var n=0;n<_pageData.group.length;n++){

                    var groupName=_pageData.group[n];
                    var _g=jsf3.cache.group[groupName];

                    if(_g){
                        if(_g.after){
                            var _callback=_g.after;

                            groupCallbackList.push(function(next2){   
                                _callback(callObj2);
                                if(!callObj2._waited){
                                    next2();
                                }
                            });

                        }

                        if(_g.afterNext){
                            var _callback=_g.afterNext;

                            groupCallbackList.push(function(next2){   
                                _callback(callObj2);
                                if(!callObj2._waited){
                                    next2();
                                }
                            });
                        }
                    }
                }

                groupCallbackList.push(function(){
                    next();
                });

                jsf3.sync(groupCallbackList);
            },

            function(next){

                /** after */
                if(!_pageData.after){
                    next();
                    return;
                }

                var callback=_pageData.after;
                callback(callObj);
                if(!callObj._waited){
                    next();
                }

            },

            function(next){

                /** afterNext */
                if(!_pageData.afterNext){
                    next();
                    return;
                }

                var callback=_pageData.afterNext;
                callback(callObj);
                if(!callObj._waited){
                    next();
                }

            },

            function(next){

                /** option after */
                if(!option.callback){
                    next();
                    return;
                }

                if(!option.callback.after){
                    next();
                    return;
                }

                option.callback.after(callObj);

                if(!callObj._waited){
                    next();
                }

            },
            function(next){
                jsf3.locking.link=false;
            },
        ]);
        
    },

    /**
     * back
     * @param {} option 
     */
    back:function(option){

        if(!option){
            option={};
        }

        var now=jsf3.buffer.nowPage;

        if(!jsf3.buffer.pages[jsf3.buffer.pageMoveIndex-2]){
            if(jsf3.cache.common.exit){
                var callback=jsf3.cache.common.exit;
                callback();
            }
            return;
        }

        var pageArea=$("pagearea");

        var _back=jsf3.buffer.pages[jsf3.buffer.pageMoveIndex-2];
        jsf3.buffer.pageMoveIndex--;

        var callObj={
            mode:"back",
            _waited:false,
            nowPage:now,
            backPage:_back,
            wait:function(){
                callObj._waited=true;
            },
            exit:function(){
                callObj._waited=true;        
                jsf3.locking.link=false;
            },
        };

        var pageArea=$("pagearea");
        pageArea.addClass("back");
       
        var backpage='<page id="'+_back.id+'"><wk>'+_back.content+'</wk></page>';
        if(_back.option){
            if(pageArea.find("#"+_back.id).length){
                pageArea.find("#"+_back.id).removeClass("closed");
            }
            else{
                pageArea.append(backpage);                
            }
        }
        else{
            pageArea.append(backpage);
        }

        var backPageObj=pageArea.find("#"+_back.id);
        callObj.pageObj=backPageObj;

        jsf3.buffer.nowPage=_back;

        if(now){
            $("pagearea page#"+now.id).removeClass("open").addClass("closed");
        }

        var _backPageData={};
        if(jsf3.cache.page[_back.pageName]){
            _backPageData=jsf3.cache.page[_back.pageName];
        }

        if(_backPageData.class){
            backPageObj.addClass(_backPageData.class);
        }

        jsf3.sync([

            function(next){

                /** set wait function */
                callObj.next=function(){
                    callObj._waited=false;
                    next();
                };
                next();
            },

            function(next){

                /** group before / baforeBack */
                if(!_backPageData.group){
                    next();
                    return;
                }

                if(typeof _backPageData.group=="string"){
                    _backPageData.group=[_pageData.group];
                }

                var groupCallbackList=[];

                var callObj2={
                    mode:"back",
                    _waited:false,
                    nowPage:callObj.now,
                    backPage:callObj.back,
                    wait:function(){
                        callObj2._waited=true;
                    },
                    exit:function(){
                        callObj2._waited=true;        
                        jsf3.locking.link=false;
                    },
                };

                groupCallbackList.push(function(next2){
                    callObj2.next=function(){
                        callObj2._waited=false;
                        next2();
                    };
                    next2();
                });

                for(var n=0;n<_backPageData.group.length;n++){

                    var groupName=_backPageData.group[n];
                    var _g=jsf3.cache.group[groupName];

                    if(_g){
                        if(_g.before){
                            var _callback=_g.before;

                            groupCallbackList.push(function(next2){   
                                _callback(callObj2);
                                if(!callObj2._waited){
                                    next2();
                                }
                            });
                        }

                        if(_g.beforeBack){
                            var _callback=_g.beforeBack;

                            groupCallbackList.push(function(next2){   
                                _callback(callObj2);
                                if(!callObj2._waited){
                                    next2();
                                }
                            });   
                        }
                    }
                   
                }

                groupCallbackList.push(function(){
                    next();
                });

                jsf3.sync(groupCallbackList);
 
            },

            function(next){

                /** before */
                if(!_backPageData.before){
                    next();
                    return;
                }

                var callback=_backPageData.before;
                callback(callObj);
                if(!callObj._waited){
                    callObj.next();
                }

            },

            function(next){

                /** option before */
                if(!option.callback){
                    next();
                    return;
                }

                if(!option.callback.before){
                    next();
                    return;
                }

                option.callback.before(callObj);

                if(!callObj._waited){
                    next();
                }
            },
            function(next){

                /** beforeBack */
                if(!_backPageData.beforeBack){
                    next();
                    return;
                }

                var callback=_backPageData.beforeBack;
                callback(callObj);
                if(!callObj._waited){
                    callObj.next();
                }
            },

            function(next){

                /** page tag class move */
                var pageClose=function(){
                    pageArea.find("page#"+now.id).remove();
                };

                var pageOpen=function(){
                    var nowPageArea=pageArea.find("page#"+_back.id);
                    nowPageArea.addClass("open");
                };
                
                if(jsf3.option.animation){
                    pageOpen();
                    setTimeout(function(){
                        pageClose();
                        next();                            
                        setTimeout(function(){
                            pageArea.removeClass("back");
                        },500);
                    },500);
                }
                else{
                    pageOpen();
                    pageClose();
                    next();
                    pageArea.removeClass("back");
                }

            },
        
            function(next){

                /** group after / afterNext */
                if(!_backPageData.group){
                    next();
                    return;
                }

                var groupCallbackList=[];

                var callObj2={
                    mode:"back",
                    _waited:false,
                    nowPage:callObj.now,
                    backPage:callObj.back,
                    wait:function(){
                        callObj2._waited=true;
                    },
                    exit:function(){
                        callObj2._waited=true;        
                        jsf3.locking.link=false;
                    },
                };

                groupCallbackList.push(function(next2){
                    callObj2.next=function(){
                        callObj2._waited=false;
                        next2();
                    };
                    next2();
                });

                for(var n=0;n<_backPageData.group.length;n++){

                    var groupName=_backPageData.group[n];
                    var _g=jsf3.cache.group[groupName];

                    if(_g){
                        if(_g.after){
                            var _callback=_g.after;

                            groupCallbackList.push(function(next2){   
                                _callback(callObj2);
                                if(!callObj2._waited){
                                    next2();
                                }
                            });

                        }

                        if(_g.afterNext){
                            var _callback=_g.afterNext;

                            groupCallbackList.push(function(next2){   
                                _callback(callObj2);
                                if(!callObj2._waited){
                                    next2();
                                }
                            });
                        }
                    }
                }

                groupCallbackList.push(function(){
                    next();
                });

                jsf3.sync(groupCallbackList);
            },

            function(next){

                /** after */
                if(!_backPageData.after){
                    next();
                    return;
                }

                var callback=_backPageData.after;
                callback(callObj);
                if(!callObj._waited){
                    next();
                }

            },

            function(next){

                /** afterNext */
                if(!_backPageData.afterNext){
                    next();
                    return;
                }

                var callback=_backPageData.afterNext;
                callback(callObj);
                if(!callObj._waited){
                    next();
                }

            },

            function(next){

                /** option after */
                if(!option.callback){
                    next();
                    return;
                }

                if(!option.callback.after){
                    next();
                    return;
                }

                option.callback.after(callObj);

                if(!callObj._waited){
                    next();
                }


            },

        ]);

    },

    refresh:function(option){
        
        if(!option){
            option={};
        }

        var now=jsf3.buffer.nowPage;

        var callObj={
            _waited:false,
            nowPage:now,
            wait:function(){
                this._waited=true;
            },
        };

        var pageObj=$("pagearea").find("#"+now.id);
        callObj.pageObj=pageObj;

        var _pageData={};
        if(jsf3.cache.page[now.pageName]){
            _pageData=jsf3.cache.page[now.pageName];
        }

        jsf3.sync([

            function(next){

                /** set wait function */
                callObj.next=function(){
                    callObj._waited=false;
                    next();
                };
                next();
            },

            function(next){

                /** group refresh */
                if(!_pageData.group){
                    next();
                    return;
                }

                if(typeof _pageData.group=="string"){
                    _pageData.group=[_pageData.group];
                }

                var groupCallbackList=[];

                var callObj2={
                    _waited:false,
                    nowPage:now,
                    wait:function(){
                        callObj2._waited=true;
                    },
                    exit:function(){
                        callObj2._waited=true;        
                        jsf3.locking.link=false;
                    },
                };

                groupCallbackList.push(function(next2){
                    callObj2.next=function(){
                        callObj2._waited=false;
                        next2();
                    };
                    next2();
                });

                for(var n=0;n<_pageData.group.length;n++){

                    var groupName=_pageData.group[n];
                    var _g=jsf3.cache.group[groupName];

                    if(_g){
                        if(_g.refresh){
                            var _callback=_g.refresh;

                            groupCallbackList.push(function(next2){   
                                _callback(callObj2);
                                if(!callObj2._waited){
                                    next2();
                                }
                            });
                        }
                    }
                   
                }

                groupCallbackList.push(function(){
                    next();
                });

                jsf3.sync(groupCallbackList);
            },
            function(next){
                
                /** refresh */
                if(!_pageData.refresh){
                    next();
                    return;
                }
                
                var callback=_pageData.refresh;
                callback(callObj);
                if(!callObj._waited){
                    next();
                }

            },
            function(next){
                
                /** option refresh */
                if(!option.callback){
                    next();
                    return;
                }

                if(!option.callback.refresh){
                    next();
                    return;
                }

                option.callback.refresh(callObj);

                if(!callObj._waited){
                    next();
                }

            },

        ]);

    },

    clear:function(){
        jsf3.buffer.pages=[];
        jsf3.buffer.pageMoveIndex=0;
    },


    _getAregment:function(pageName){

        var pageNames=pageName.split("?");
        
        pageName=pageNames[0];

        var aregment=null;
        if(pageNames[1]){

            aregment={};
            var _arg=pageNames[1];

            _arg=_arg.split("&");

            for(var n=0;n<_arg.length;n++){
                var args=_arg[n];
                args=args.split("=");

                aregment[args[0]]=args[1];
            }
        }

        return {
            pageName:pageName,
            aregment:aregment,
        };

    },
};