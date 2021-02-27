var HT_OBJ_DB_ACT_URI='YICTWEB/WebService';
//var HT_OBJ_localhost=window.location.host;
//var HT_OBJ_protocol=window.location.protocol;
var HT_OBJ_history=true;

/*ht_obj 模拟owl.carousel.js jquery 挂接方案 */
if (typeof Object.create !== "function") {
  Object.create = function (obj) {
      function F() {}
      F.prototype = obj;
      return new F();
  };
}
var $HT_OBJ = new Object;
var $HT_OBJ_IDS = new Array;// ht_objects gobal index
var $HT_OBJ_PARAMS={};
var $HT_OBJ_HISTORY=[];
(function ($, window, document) {
  var Ht_obj = {
      Init : function (add_obj,options, el) {
        //set object's goable index;
        var randomStr = this._PUB_RandomStr(8);
        this._SetObjID(randomStr);
        this.this_obj_str="$HT_OBJ_IDS['"+this.objID+"'].options";
        this.this_obj_base_str="$HT_OBJ_IDS['"+this.objID+"']";
        this.countArray=new Array();
        this.Field_Eval_Index=new Array();
        this.countMax=3; 
      
        //set base
        var base = this;
        base.$elem = $(el);
        
        //Init Object Name
		if (options.ht_obj_name ){//ly second
			this.objName=options.ht_obj_name;
		}else{
			this.objName=this.$elem.attr("ht_obj");
			if (!this.objName){
	            this._PUB_Error(this._PUB_Static.Str()+"","ht_obj_name is empty! \r\nplease set by ht_obj_name or ht_obj='****'");
	            return null;
	        }
		} 
		
        if ($HT_OBJ[this.objName] && $HT_OBJ[this.objName].$elem!=$(el)){//ly second
            this._PUB_Error(this._PUB_Static.Str()+"","name '"+this.objName+"' is already used!");
            return null;
        }
        $HT_OBJ[this.objName]=this;
        this._PUB_Static.NewPush("$HT_OBJ."+this.objName+"");  
        
        //Init Debug Step
        this.errorLevel=0;
        var error_level_str=this.$elem.attr("ht_error");
        if (error_level_str && !isNaN(error_level_str))
        		this.errorLevel=parseInt(error_level_str);
        
        base.options = $.extend(true,{}, $.fn.ht_obj.options, base.$elem.data(), options,this.options_ext);
        base.options.__parentObj=this;

        base.userOptions = options;
        //$ht_obj[el.id]=this;
		$.extend(base,add_obj); //添加新对象

		//自动加载
		if (base.options.do_load)
			this.Load();

		//外挂函数
		//base.$elem.ht_load=function(){this.Load}
		//base.loadContent();
		this.firstLoad=false;
		return this;
	  },

		Show:function(param,div){
			this._Show();
		},

		Load:function(params){
			this._Load(params)
		},

		Call: function (func_name,param1, param2, param3, param4, param5) {
			this._PUB_Static.Push(this.ObjName + "->Call()")
			while (true) {
				if (func_name.indexOf("@.") == 0){
					if (!this.options[func_name.substr(2)]) 
						break;
					this._PUB_Static.Pop();
					return this.options[func_name.substr(2)].call(this.options, param1, param2, param3, param4, param5);
				}else if (func_name.indexOf("@") == 0) {
					var func_obj = "__" + func_name.substr(1);
					if (!this.options[func_obj]) 
						break;
					this._PUB_Static.Pop();
					return this.options[func_obj].call(this.options, param1, param2, param3, param4, param5);	
				} else if (func_name.indexOf("ht_") == 0) {
					if (this.options[func_name]){
						this._PUB_Static.Pop();
						return this.options[func_name].call(this.options, param1, param2, param3, param4, param5);
					}else{
						var ht_show_str=$(this.$elem).attr(func_name);
						if (!ht_show_str || ht_show_str=='ht_obj') 
							break;
						this._PUB_Static.Pop();
						return this.options['__EVAL_NEXT'].call(this.options, func_name, param1, param2, param3, param4, param5); //之后改为__HT_OBJ_CALL（）
					}
				} 
				break
			}
			this._PUB_Error(this._PUB_Static.Str() + func_name + " not exited!");
			this._PUB_Static.Pop()
			return null;
		},

		Data:function(){

		},
		Eval:function(){

		},

      _SetObjID : function(obj_id){
        //取消旧ObjID
        var i=1;
        if((this.objID!=undefined)&&(HT_OBJ_IDS[this.objID]!=undefined))
          $HT_OBJ_IDS[this.objID]=null;
        
        //设置新的objID
        $HT_OBJ_IDS[obj_id]=this;
        this.objID = obj_id;
      },

      _Load:function(cfg_obj){
    	    var ht_load_str=null;
    	    
			//ht_options
			if (!this.firstLoad){
				var ht_cfg_str=this.$elem.attr("ht_options");
				if (ht_cfg_str){
					this._PUB_Static.Push("Init ht_options")
					var ht_cfg=this._CountStr$ComplyAndEval("{"+ht_cfg_str+"}",true);
					if (!ht_cfg)
						this._PUB_Error(this._PUB_Static.Str()+"Load ht_options error!");
					this._PUB_Static.Pop()
					$.extend(this.options,ht_cfg);
				}

				//ht_data
				var ht_data_cfg=this.$elem.attr("ht_data");
				if (ht_data_cfg){
					this._PUB_Static.Push("Init ht_data")
					var data=null;
					var ht_data_cfg=ht_data_cfg.trim();
					//ly model;
					var ht_data={}
					if (ht_data_cfg.indexOf('{')==0)
						ht_data=this._CountStr$ComplyAndEval(ht_data_cfg,true);
					else
						ht_data=this._CountStr$ComplyAndEval("{"+ht_data_cfg+"}",true);
					if (!ht_data)
						this._PUB_Error(this._PUB_Static.Str()+"Load->ht_data defined error!");
					this._PUB_Static.Pop()
					$.extend(this.options.$DATA,ht_data);
				}
				this.firstLoad=true;
			}
			if (cfg_obj){
				for(a in cfg_obj)
					$.extend(this.options.$DATA[a],cfg_obj[a]);
			}
    	    
			//ht_load
			if (this.options.ht_load){
				this._PUB_Static.Push("ht_load")
				this.options.ht_load([["{@_THIS_OBJ}",this.this_obj_str],["{@_IS_FIRST_LOAD}",''+this.firstLoad]]);//count and act;
    	  		this._PUB_Static.Pop()
			}else if ((ht_load_str=$(this.$elem).attr("ht_load"))){
    	  		//user defined ht_load
    	  		this._PUB_Static.Push("ht_load")
    	  		var rt_value=this._CountStr$ComplyAndEval(ht_load_str,false,[["{@_THIS_OBJ}",this.this_obj_str],["{@_IS_FIRST_LOAD}",''+this.firstLoad]],false);//count and act;
   	  			if (!rt_value)
    	  			this._PUB_Error(this._PUB_Static.Str()+"Load script error",ht_load_str);
    	  		this._PUB_Static.Pop()
    	  	}else if (this.options.url){
    	  		//using default load->options="url ***" send ajax
    	  		this._PUB_Static.Push("ht_option.url action")
    	  		this._PUB_SendAjax(this,this.options,function(data){
                if (data) {
                		this.options.$DATA=data;
                		this._Show();
                }
                this._PUB_Static.Pop();
    	  		},function(data){
    	  			this._PUB_Error(this._PUB_Static.Str()+"network error","can't load JSON!");
    	  			this._PUB_Static.Pop()
    	  		});
    	  		
    	  	}else{//no ajax operate     
    	  		//just show
    	  		this._Show();// div show action
        }
	  },

      _Show_for:function(find_for,param,no_refresh,this_div){//ly second
	  	  var items=this_div.find("["+find_for+"]");//for nodes
	  	  for(var i=0; i<items.length; i++){
	          //get params {src_obj} to {#_product} index {#_num}
	          var t=$(items[i]).attr(find_for).split(" in "); 
	          var src_obj_str,for_num=null;
	          if (t.length==1)
	          		src_obj_str=t[0]
	          else {
		            	src_obj_str=t[1];
		            for_num=t[0];
	          }

	          //backup or pop first inner_html ??可以改进成统一模式
	          var for_html,is_append=0;
	          if (no_refresh)
	          		is_append=$(items[i]).attr("ht_for_cnt") ? parseInt($(items[i]).attr("ht_for_cnt")) : 0;		
	          if ($(items[i]).data("for_html")==undefined){//first init
	          		for_html=$(items[i]).html();//get node's inner html
	          		$(items[i]).data("for_html",for_html);
	          }else{//other step_
	          		for_html=$(items[i]).data("for_html")
	          }
	          
	          //eval and count;
	          this._PUB_Static.Push(find_for);
	          var k=0,new_html=""
	          var arr_obj=this._CountStr$ComplyAndEval(src_obj_str);
	          if (arr_obj!=null){//for action from arr_obj
	        	  	for(j in arr_obj){//for all data son object
	          		if (no_refresh && k<is_append){
	          			k++;
	          			continue;
	          		}	
			        if (t[1])
			          new_html+=this._PUB_ReplaceStr(for_html,for_num,""+j);  //replace ({#_num} field str)
			        else
			          new_html+=for_html;
			        k++;
	          	}
	          }else{
	        	  	//可能存在for 元素不存在的情况,将不提示错误，直接为空
	          }
	          this._PUB_Static.Pop();
	          	
	          if (no_refresh && is_append!=0)
	          		$(items[i]).append(new_html);
	          else
	          		$(items[i]).html(new_html);
			  $(items[i]).attr("ht_for_cnt",""+k); 
	  	  }
	  	  return true;
	  },
	  
      _Show_for_start:function(find_for,this_div,param,no_refresh,for_html_in){//ly second
		var items=this_div.find("["+find_for+"]");//for nodes
		var from=$(this_div).attr("ht_from") && this._PUB_IsNumber($(this_div).attr("ht_from")) ? ParseInt($(this_div).attr("ht_from")):0;
		var to=$(this_div).attr("ht_to") && this._PUB_IsNumber($(this_div).attr("ht_to")) ? ParseInt($(this_div).attr("ht_to")):items.length;
		for(var i=from; i<items.length && i<to; i++){
		  //get params {src_obj} to {#_product} index {#_num}
		  var src_obj_str=$(items[i]).attr(find_for);
		  var for_num=null;
		  var for_html=null;
		  //if_do_it
		  var for_test=$(items[i]).attr("ht_for_test")
		  if (for_test){
			  var for_test_success=this._CountStr$ComplyAndEval(for_test,true);
			  if (!for_test_success)
			  	continue;
		  }
		  //backup or pop first inner_html ??可以改进成统一模式
		  var for_html,is_append=0;
		  if (no_refresh)
				is_append=$(items[i]).attr("ht_for_cnt") ? parseInt($(items[i]).attr("ht_for_cnt")) : 0;	
		  if (for_html_in && !$(items[i]).html().trim()){
				for_html=for_html_in;
		  }	else if ($(items[i]).data("for_html")==undefined){//first init
				  for_html=$(items[i]).html();//get node's inner html
				  $(items[i]).data("for_html",for_html);
		  }else{//other step_
				  for_html=$(items[i]).data("for_html")
		  }
		  
		  //eval and count;
		  this._PUB_Static.Push(find_for);
		  var k=0,new_html=""
		  var arr_obj=this._CountStr$ComplyAndEval(src_obj_str);
		  if (arr_obj!=null){//for action from arr_obj
				  for(j in arr_obj){//for all data son object
					if (no_refresh && k<is_append){
						k++;
						continue;
					}	
					var temp_html=this._PUB_ReplaceStr(for_html,"{@_FOR_ITEM}",src_obj_str+"["+j+"]");
					new_html+=this._PUB_ReplaceStr(temp_html,"{@_FOR_NUM}",""+j);
					//new_html+=this._PUB_ReplaceStr(temp_html,"{@_FOR_PATH}",this._PUB_ArrStrToPath(src_obj_str+"["+j+"]","+'/'+"));
					//new_html+=this._PUB_ReplaceStr(temp_html,"{@_FOR_PATH}",(src_obj_str+"["+j+"]").split("}")[1]);
					k++;
				}
		  }else{
				//可能存在for 元素不存在的情况,将不提示错误，直接为空
		  }
		  this._PUB_Static.Pop();
			  
		  if (no_refresh && is_append!=0)
				  $(items[i]).append(new_html);
		  else
				  $(items[i]).html(new_html);
		  $(items[i]).attr("ht_for_cnt",""+k); 
		  
		  //递归下一层次
		  if (!this._Show_for_start("ht_for_next",$(items[i]),param,no_refresh,for_html))
				return false;
		}
		return true;
  	  },
      
      _GetAttr:function(src_obj,item,find_str){
    	  	var attrs={};
    	  	$.each(item.attributes, function() {
        	    //if(this.specified && this.name.indexOf("ht_")==0 ) {
        	    if(this.specified && find_str.indexOf("["+this.name+"]")>=0 ) {
        	    		attrs[this.name]=this.value;
        	    }
    	  	})
    	  	return attrs;
      },
      
      _RefreshHtAttr:function(src_obj,item,find_str,new_value){
    	    var attrs=this._GetAttr(src_obj,item,find_str);
    	    for(var a in attrs){
				src_obj._PUB_Static.Push(a);
			if (!$(item).attr("id"))
				$(item).attr("id",this._PUB_RandomStr(10)) //ly fload
            var set_value=src_obj._CountStr$ComplyAndEval(attrs[a],undefined,[["{@_THIS}","$('#"+$(this).attr("id")+"')"],["{@_THIS_ID}",$(item).attr("id")],["{@_THIS_OBJ_NAME}",src_obj.objName]]);//count and not act;
            src_obj._PUB_Static.Pop();
            if (a=="ht_html"){
            		$(item).html(set_value);
            }else if (a=="ht_val"){
            		src_obj._SetObjValue($(item),set_value);
            }else if (a=="ht_src" && $(item).is("select")){
	        		if ($(item).attr("ht_placeholder")){//init --select ——
	        			var holder=$(item).attr("ht_placeholder") ;
	        			var text1=holder.split(":")[0]
	        			var id_value=holder.split(":").length==2 ? holder.split(":")[1] : "0";
	        			var add_obj={};
	        			add_obj[id_value]={id:id_value,text:text1,children:{}};
	        			set_value=$.extend(true,add_obj,set_value);
	        		}
            		src_obj._InitSelect($(item),set_value,new_value);
            		if ($(item).attr("ht_src_then")){
            			src_obj._CountStr$ComplyAndEval($(item).attr("ht_src_then"),undefined,[["{@_THIS_NODE_ID}",$(item).attr("id")],["{@_THIS_OBJ_NAME}",src_obj.objName]]);
            		}
            }else if(a=="ht_act"){
					//$(item).attr("ht_act",";");    // then do nothing;
					var i=0;
            }else if (a=="ht_class"){
            		if (set_value)
            			$(item).attr(a.substr(3),set_value);
            		else
            			$(item).removeClass(a.substr(3))
            }else if (a=="ht_show"){
	        		if (set_value)
	        			$(item).show();
	        		else
	        			$(item).hide();
	        }else
            		$(item).attr(a.substr(3),set_value);// set node value for display;
    	    }
	  },
	  
	  _ShowHtClickAll:function(no_refresh,item_obj,ht_click_str,click_str){
            if (no_refresh && this._GetDone(item_obj,ht_click_str))
				return;
            var this_obj_id=this.objID;
            var this_obj_name=this.objName;
            $(item_obj).unbind(click_str);
            $(item_obj)[click_str](function(){
                //$HT_OBJ_IDS[this_obj_id]._ShowHtClickCB(ht_click_str,this,this_obj_id,this_obj_name);
                var set_str=$(this).attr(ht_click_str);
                //取得参数name=me;id=me
                if ($(this).attr("type")=='submit'){
                        var ps=$(this).parents();
                        var form_div=null;
                        for(var i=0; i<ps.length; i++){
                            if ($(ps[i]).prop("nodeName").toLowerCase()=="form"){
                                form_div=ps[i];
                                break;
                            }   
                            if ($(ps[i]).attr('ht_obj')==this_obj_name){
                                break;
                            }       
                        }
                        if (form_div==null){
                            $HT_OBJ_IDS[this_obj_id]._PUB_Error($HT_OBJ_IDS[this_obj_id]._PUB_Static.Str()+"submit: parent form node not exited!");
                         return null;
                        }
                        $(form_div).unbind('submit');
                        $(form_div).submit(function(e){
                            $HT_OBJ_IDS[this_obj_id]._CountStr$ComplyAndEval(set_str,false,undefined,false);
                            e.preventDefault();
                        });
                }else{
                    if (!$(this).attr("id"))
                        $(this).attr("id",$HT_OBJ_IDS[this_obj_id]._PUB_RandomStr(10))
                    $HT_OBJ_IDS[this_obj_id]._CountStr$ComplyAndEval(set_str,false,[["{@_HT_OBJ_CB_DATA}",$HT_OBJ[this_obj_name].this_obj_str+".ht_obj_cb_data"],["{@_THIS}","$('#"+$(this).attr("id")+"')"],["{@_THIS_CHILD}","$('#"+$(this).attr("id")+"').children"],["{@_THIS_NEXT}","$('#"+$(this).attr("id")+"').next"],["{@_THIS_ID}",$(this).attr("id")],["{@_THIS_OBJ_NAME}",this.objName]],false); 
                }       
            });
            this._SetDone(item_obj,ht_click_str);
        },		
	
      _Show:function(param,div){//通用显示循环
		var this_div=this.$elem;
		if (typeof div=="string"){
			var nodes=this.$elem.find("[id='"+div+"']");
			if (nodes.length<=0){
				this._PUB_Error(this._PUB_Static.Str()+"@SHOW(param,"+div+") "+div+" not exited!");
				return null;
			}
			this_div=$(nodes[0]);
		}else if (typeof div=="object")
			this_div=$(div);
		
		var no_refresh=param && param.indexOf("no_refresh")>=0 ? true:false;

		//check html for some unidentified error
		//var i=this.$elem.html().indexOf("/>");
		// if (i>0)
		// 	console.error(this._PUB_Static.Str()+"Show()->html() '/>' nodes at "+i+" may course some unidentified error! please change to<*></*> ")
		
		//ly ht_model 选择显示
		var items=this_div.find("[ht_model]");
		var model_already="";
		for(var i=0; i<items.length; i++){
			var model_name=$(items[i]).attr("ht_model");
			//去重
			if (model_already.indexOf(model_name+";")>=0)
				this._PUB_Error(this._PUB_Static.Str()+" ht_model=\""+model_name+"\" already defined!");
			model_already+=model_name+";";
			if ($(items[i]).attr("ht_for") || $(items[i]).attr("ht_for_item"))
				this._PUB_Error(this._PUB_Static.Str()+" 'ht_model' and 'ht_for' should not coexist in one node!");

			//备份
			var model_html="";
			if ($(items[i]).data("ht_model_"+model_name)==undefined){//first init
				model_html=$(items[i]).html();//get node's inner html
				$(items[i]).data("ht_model_"+model_name,model_html);
			}else{//other step_
				model_html=$(items[i]).data("ht_model_"+model_name);
			} 
			//替换
			if(!no_refresh){
				var ht_model_test_str=$(items[i]).attr("ht_test") ? $(items[i]).attr("ht_test") : "true";
				var ht_model_test=this._CountStr$ComplyAndEval(ht_model_test_str,true);
				if (ht_model_test){
					$(items[i]).html(model_html);
					$(items[i]).show();
				}
				else{
					$(items[i]).html(""); //如果没有设置则清除，保留i
					$(items[i]).show();
				}
			}
		}

		//get all attr=[ht_for] nodes and set 
		if (!this._Show_for("ht_for",param,no_refresh,this_div)){
			return;
        }else if (!this._Show_for("ht_for_1",param,no_refresh,this_div)){
        		return;
        }else if(!this._Show_for("ht_for_2",param,no_refresh,this_div)){
        		return;
		}
		
    	  //new for operate
    	if (!this._Show_for_start("ht_for_item",this_div,param,no_refresh))
	         	return;
        
        var items=this_div.find("[ht_id]");
        for(var i=0; i<items.length; i++){
        	    var src_str=$(items[i]).attr("ht_id");
        	    $(items[i]).attr("id",this._CountStr$ComplyAndEval(src_str));  
        }
        
        var find_str="[ht_val],[ht_src],[ht_href],[ht_class],[ht_name],[ht_title],[ht_width],[ht_height],[ht_download],[ht_link],[ht_act],[ht_style],[ht_html],[ht_show],[ht_data],ht_for_value";
        var items=this_div.find(find_str);
        for(var i=0; i<items.length; i++){
      	  	if (no_refresh && this._GetDone(items[i],"ht_some"))
      		  continue;
      	  	var src_obj=this;
      	  	$(items[i]).each(function() {
      	  		src_obj._RefreshHtAttr(src_obj,items[i],find_str);
	      	});
      	  	this._SetDone(items[i],"ht_some");
        }    

        //ht_click: get all attr=[ht_click] nodes and set
        var items=this_div.find("[ht_click]");
        for(var i=0; i<items.length; i++){
			this._ShowHtClickAll(no_refresh,items[i],"ht_click","click")
		}
		var items=this_div.find("[ht_keypress]");
        for(var i=0; i<items.length; i++){
			this._ShowHtClickAll(no_refresh,items[i],"ht_keypress","keypress")
    	}
        
        //ht_count Reg: get all attr=[ht_count] nodes and set
        var items=this_div.find("[ht_count]");//今后可以考虑加入$.*的查询，代替ht_count
        for(var i=0; i<items.length; i++){
        		var eval_str=$(items[i]).attr("ht_count");
        		var count_id=$(items[i]).attr("ht_bind");
        		var obj={
        			obj:items[i],
        			eval:eval_str,
        			mark:false
        		}
        		if (!count_id)
        			count_id=this._PUB_RandomStr(8);
        		$(items[i]).attr("ht_count_id",count_id);
        		this.countArray[count_id]=obj //front table
        		//add bind for {$.***} count
        		var bind_arr=this._GetCountFields(eval_str);
        		for(a in bind_arr){
        			this._BandFieldEval(a,count_id,eval_str); //back table
        		}
        		//ly add for attr count 
        		var attrs=this._GetAttr(this,items[i],"[ht_style],[ht_read],[ht_class],[ht_src],[ht_href]");
        		for(b in attrs){
        			var bind_arr=this._GetCountFields(attrs[b]);
            		for(a in bind_arr){
            			this._BandFieldEval(a,count_id,attrs[b]); //back table
            		}
        		}
        }
        
        //ht_bind: get all attr=[ht_bind] nodes; set value and onChange Reg;
        var items=this_div.find("[ht_bind]");
        var dup_arr=[];
        this._PUB_Static.Push("ht_bind");
        for(var i=0; i<items.length; i++){
            //get obj_id; test duplicated
            var obj_id=$(items[i]).attr("ht_bind");
            if (dup_arr[obj_id]){
              this._PUB_Error(this._PUB_Static.Str()+"{$."+obj_id+"} already binded!")
              break;
            }
            dup_arr[obj_id]=true;
            //get data source value; test exited
            var new_value=this._Get$DATA(obj_id);
            if (new_value==undefined){
            		var obj_count=$(items[i]).attr("ht_count");
            		if (obj_count)
            			this._Set$DATA(obj_id,"");//ht_count and ht_bind all seted: can create data node;
            		else{
            			if (this.options.$creating){
            				var obj_default=$(items[i]).attr("ht_init");
            				if (obj_default){
            					this._Set$DATA(obj_id,obj_default);
            					new_value=obj_default;
            				}
            				else
            					this._Set$DATA(obj_id,"");
            			}else{
            				this._PUB_Error(this._PUB_Static.Str()+"{$."+obj_id+"} is not exited!")
            				break;
            			}
            		}
            } 
            //add bind for "ht_count_to"
	    	    var count_to_str=$(items[i]).attr("ht_count_to");
	    	    if (count_to_str){
	    			var count_to_arr=count_to_str.split(";");
	    			for(count_to in count_to_arr){
	    				var tmp_items=this_div.find("[ht_bind='"+count_to+"']"),tmp;
	    				if (!tmp_items && tmp_items.length==0){
	    					this._PUB_Error(this._PUB_Static.Str()+"ht_count_to='{$."+count_to+"}' not exited!")
	    		             break;
	    				}
	    				var tmp1=$(tmp_items[0]).attr("ht_count_id");
	    				if (!tmp1){
	    					this._PUB_Error(this._PUB_Static.Str()+"{$."+count_to+"}'s count_to_id='*' is empty!");
	    					break;
	    				}
	    				this._BandFieldEval(count_id,tmp1,""); //back table
	    			}
	    		}
            //binding actions;
        		this._ChangeField(obj_id,"disp|mark",new_value); //set change Field and mark count.
        		var eval_str=this.this_obj_base_str+"._ChangeField('"+obj_id+"','save|mark');"+this.this_obj_base_str+"._CountField('"+obj_id+"',"+this.countMax+");"+this.this_obj_base_str+"._VerifyField('"+obj_id+"');";
        		var ht_change=$(items[i]).attr("ht_change");
        		if (ht_change){//代替后面ht_change
        			//eval_str+= this.this_obj_base_str+"._CountStr$ComplyAndEval(\""+ht_change+"\")"
        			eval_str+= this.this_obj_base_str+"._CountStr$ComplyAndEval(\""+ht_change+"\",false,[['{@_THIS_BIND_OBJ}',"+this.this_obj_base_str+"._Get$DATA('"+obj_id+"')]])";
        		}
        		$(items[i]).attr("onchange",eval_str); 
        		//$(items[i]).attr("onchange","alert(this.value);"+this.this_obj_base_str+"._ChangeField('"+obj_id+"','save|mark');"); 	      
        }
        this._PUB_Static.Pop(); 
        
        //ht_change: get all attr=[ht_click] nodes and set
        var items=this_div.find("[ht_change]");
        for(var i=0; i<items.length; i++){
        	  if (no_refresh && this._GetDone(items[i],"ht_change"))
        		  continue;
        	  if ($(items[i]).attr("ht_bind"))
        		  continue; //ht_bind 在前面已处理
          var this_obj_id=this.objID;
          $(items[i]).unbind('change')
          $(items[i]).change(function(){
        	    var set_str=$(this).attr("ht_change");
        	    $HT_OBJ_IDS[this_obj_id]._CountStr$ComplyAndEval(set_str,false);
          })
          this._SetDone(items[i],"ht_change");
        }
        
        //do all count at refresh mode;
        this._PUB_Static.Push("init CountAllFields()");
        this._CountAllField(this.countMax);
        this._PUB_Static.Pop(); 

        //测试html改进
        var all_html=this_div.html();
      },
      
   	  _CountAllField:function (max){
  	  	//do nothing
   		
        for (;max>0;max--){
        	  var all_unmark=true;
          for(a1 in this.countArray){//if find count {$.field} in eval_str;
              if (this.countArray[a1].mark){
                var new_value=this._CountStr$ComplyAndEval(this.countArray[a1].eval);
                if (new_value==undefined)
                  return;
                this._ChangeField(this.countArray[a1].obj,"save|disp|mark",new_value);
                this.countArray[a1].mark=false;
                all_unmark=false;
              }
            }
          if (!all_unmark)
        	  	break;
        }
   	  },
   	  
   	  _CountField:function (obj_id,max){
        //end call too long
        if (max==0)
          return;
        max--;
  	  	//do relation count_objs;
        for(count_id in this._GetBindField(obj_id)){//最快
          var count=this.countArray[count_id];
          var new_value=this._CountStr$ComplyAndEval(count.eval);
          if (new_value==undefined)
            return;
//          this._ChangeField(count.obj,"save|disp",new_value);
          this._ChangeField(count.obj,"save|disp|attr",new_value);
          var count_obj_id=$(count.obj).attr("ht_bind");
          if (count_obj_id)
            this._CountField(count_obj_id,max)
        }
   	  },
      
      _ChangeField:function(obj,opt,new_value){
        //get this real obj and obj_id
  	  	var obj_id;
  	  	if (typeof obj == "string"){
  	  		obj_id=obj;
  	  		var items=this.$elem.find("[ht_bind='"+obj_id+"']");
  	  		obj=items[0];
  	  	}
  	  	if(typeof obj=="object"){
  	  		obj_id=$(obj).attr("ht_bind");
  	  	}
  	  	
  	  	//do display dom value
  	  	if (opt.indexOf("disp")>=0){
  	  		this._SetObjValue(obj,new_value);
  	  	}
  	  	
  	  	//ly add for attr count
  	    if (opt.indexOf("attr")>=0){
	  		this._RefreshHtAttr(this,obj,"[ht_style],[ht_read],[ht_class],[ht_src],[ht_href]",new_value);
	  	}  
  	    
  	  	//do save
  	  	if (opt.indexOf("save")>=0 && obj_id){
  	  		var value=new_value==undefined ? this._GetObjValue(obj) : new_value;
  	  		this._Set$DATA(obj_id,value);
  	  	}
  	  	
  	  	//do mark
  	  	if (opt.indexOf("mark") && obj_id){
	        for(count_id in this._GetBindField(obj_id)){//最快
	            this.countArray[count_id].mark=true;
	        } 
        }
   	  },
   	  
   	  _VerifyField:function(obj){
        //get this real obj and obj_id
  	  	var obj_id;
  	  	if (typeof obj == "string"){
  	  		obj_id=obj;
  	  		var items=this.$elem.find("[ht_bind='"+obj_id+"']");
  	  		obj=items[0];
  	  	}
  	  	if(typeof obj=="object"){
  	  		obj_id=$(obj).attr("ht_bind");
  	  	}
  	  	var v_str=$(obj).attr("ht_verify");
  	  	if (v_str){
  	  		var new_value=this._CountStr$ComplyAndEval(v_str,true,[["{@_THIS_VERIFY}",this.this_obj_str+".$Verify['"+obj_id+"']"],["{@_THIS_BIND_OBJ}","this._Get$DATA('"+obj_id+"')"]]); //"this._Get$DATA('"+field_str+"')"
  	  		if (new_value!=null)
  	  			this.options.$Verify[obj_id]=new_value;
  	  	}	
   	  },
   	  
   	  _Chk$DATA:function(obj_id){//only use for single Cart.1.Price.
        if (!obj_id)
        		return false;
        var f=obj_id.split(".");
        var obj=this.options.$DATA;
        for(var i=0; i<f.length; i++){
	      obj=obj[f[i]];
	      if (f[i]=="*")
	    	  	return true;//not for array Cart.*.Price.
          if (obj==undefined)
            return undefined; 
        }
        if (obj==undefined)
        		return false;
        else
        		return true;//for Single:Cart.1.Price Single
   	  },
   	  
   	  _Get$DATA:function(obj_id){
        if (!obj_id)
          return undefined;
        var f=obj_id.split(".");
        var obj=this.options.$DATA;
        for(var i=0; i<f.length; i++){
	      if (f[i]=="*"){//for Array: Cart.*.Price or Base.Price.*
	    	  	var arr1=[];
			for(a in obj){
				if (i==(f.length-1))
					arr1.push(obj[a]);
				else
					arr1.push(obj[a][f[i+1]]);
			}
			return arr1;
	      }
	      obj=obj[f[i]];
          if (obj==undefined)
            return undefined; 
        }
        return obj;//for Single:Cart.1.Price Single
   	  },
   	  /*
   	  _Set$DATA:function(obj_id,new_value,add_params){
        if (!obj_id)
          return false;
        var f=obj_id.split(".");
        var obj=this.options.$DATA;
        ////step in ***.***.*** until end; =>add new_value;
        for(var i=0; i<f.length; i++){
          if (i==(f.length-1)){//end:append array
        	  	if (obj[f[i]] && add_params && add_params.indexOf('append')>=0){
        	  		obj[f[i]]=obj[f[i]].concat(new_value);//append
        	  	}	
        	  	else{//end:creat array
        	  		obj[f[i]]=new_value;
        	  	}	
            break;
          }
          //step in ***.***.***
          obj=obj[f[i]]=(obj[f[i]]==undefined || obj[f[i]]==null) ? [] : obj[f[i]];
        }
        return true;
   	  },*/
   	  
   	  _Set$DATA:function(obj_id,new_value,add_params){
        if (!obj_id)
          return false;
        var f=obj_id.split(".");
        var obj=this.options.$DATA;
        ////step in ***.***.*** until end; =>add new_value;
        for(var i=0; i<f.length; i++){
          if (i==(f.length-1)){//end:append array
        	  	if (f[i]=="*"){
        	  		if (!this._PUB_IsArray(obj)){
        	  			this._PUB_Error(this._PUB_Static.Str()+"_Set$DATA(obj) '"+obj_id+"' is not array!")
   		            return false;
        	  		}	
        	  		for(var a in obj)
        	  			this._Set$DATA_obj(obj,a,new_value,add_params);
        	  	}else
        	  		return this._Set$DATA_obj(obj,f[i],new_value,add_params);
          }
          //step in ***.***.***
          obj=obj[f[i]]=(obj[f[i]]==undefined || obj[f[i]]==null) ? [] : obj[f[i]];
        }
        return true;
   	  },
   	  
   	  _Set$DATA_obj:function(obj,a,new_value,add_params){
    	  	if (obj[a] && add_params && add_params!='undefined'){
    	  		if (add_params.indexOf('append')>=0)
    	  			obj[a]=obj[a].concat(new_value);//append
    	  		else if (add_params.indexOf('update')>=0){
    	  			if (!obj[a])
    	  				obj[a]={};
    	  			$.extend(true,obj[a],new_value);
    	  		}
    	  			
    	  		else{
    	  			this._PUB_Error(this._PUB_Static.Str()+"_Set$DATA(obj,value,add_param) add_param should be 'append' or 'update'!")
   		        return false;
    	  		}		
    	  	}else{//end:creat array
    	  		if (typeof new_value=="object"){
    	  			if (this._PUB_IsArray(new_value))
    	  				obj[a]=$.extend(true,[],new_value);
    	  			else
    	  				obj[a]=$.extend(true,{},new_value);
    	  		}
    	  			
    	  		else
    	  			obj[a]=new_value;
    	  	}	
        return true;
   	  },
   	  
   	  _Del$DATA:function(obj_id){
        if (!obj_id)
          return false;
        var f=obj_id.split(".");
        var obj=this.options.$DATA;
        for(var i=0; i<f.length; i++){
          if (i==(f.length-1)){
            obj[f[i]]=null;
            break;
          }
          obj=obj[f[i]]=(obj[f[i]]==undefined || obj[f[i]]==null) ? [] : obj[f[i]];
        }
        return true;
   	  },
      
      _BandFieldEval: function(band_field_str,src_field_str,eval_str){
    		if (this.Field_Eval_Index[band_field_str] == undefined || this.Field_Eval_Index[band_field_str] == null ){ 
    			this.Field_Eval_Index[band_field_str]=new Array();
    		}
    		this.Field_Eval_Index[band_field_str][src_field_str]=true ;
      },
      
      _GetBindField: function(obj_id){
    	  	var arr1;
    	  	if(this.Field_Eval_Index[obj_id])
    	  		arr1=this.Field_Eval_Index[obj_id];
    	  	var arr2=this._GetBindField_ChgNum(obj_id);
    	  	if (arr2)
    	  		return $.extend({}, arr1, arr2);
    	  	else
    	  		return arr1;
      },
      
      _GetBindField_ChgNum: function(obj_id){//Gate{Cart.*.Price}字串。
    	  	var arr2=null,pos1=0,pos2=0,new_obj_id;
  	  	while((pos1=obj_id.indexOf(".",pos1))>0){
  	  		new_obj_id=obj_id.substr(0,pos1+1)+"*";
  			if ((pos2=obj_id.indexOf(".",pos1+1))>0)
  				new_obj_id=obj_id.substr(0,pos1+1)+"*"+obj_id.substr(pos2);
  	  		if(this.Field_Eval_Index[new_obj_id])
  	  			return $.extend(arr2,this.Field_Eval_Index[new_obj_id]);
  	  		pos1++;
  	  	}
  	  	return arr2;
      },
       
   	  _SetObjValue:function(obj,new_value){
   		if (!obj)
   			return;
        if ($(obj).is("input")|| $(obj).is("textarea")){
        		if ($(obj).attr("ht_encode")!=null){
        			var decode_value=this.options.__HTML_DECODE(new_value);
        			$(obj).val(decode_value);
        		}else
        			$(obj).val(new_value);
        }	
        else if ($(obj).is("select")){
	        	if ($(obj).attr("ht_param") && ($(obj).attr("ht_param").indexOf('text')>=0))
	        		$(obj).find("option:contains('"+new_value+"')").attr("selected",true);
	    		else
	    			$(obj).val(new_value);
        }
        else if ($(obj).is("img"))
        		$(obj).attr("src",new_value);
        else
        		$(obj).html(new_value);
   	  },
   	  
   	  _GetObjValue:function(obj){
   		if (!obj)
   			return undefined;
        if ($(obj).is("input") || $(obj).is("textarea")){
        		if ($(obj).attr("ht_encode")!=null){
        			var encode_val=this.options.__HTML_ENCODE($(obj).val())
        			return encode_val;
        		}else
        			return $(obj).val();
        }
        else if ($(obj).is("select")){
        		if ($(obj).attr("ht_param") && ($(obj).attr("ht_param").indexOf('text')>=0))
        			return $(obj).find("option:selected").text();
        		else
        			return $(obj).val();
        }	
        else if ($(obj).is("img"))
        		return $(obj).attr("src");
        else
        		return $(obj).html();
      },
      
      _InitSelect:function(sel_obj,sel_arr1,sel_pos)
      {
          var sel_pos_loc=parseInt(""+sel_pos)
          if (typeof sel_arr1=="string"){
        	  	var sel_arr=sel_arr1.split(",")
          }else{
        	  	var sel_arr=sel_arr1;	
          }   
          //clear operation
          sel_obj.empty();
          //init operation
          //for (var i=0; i<sel_arr.length; i++) {
          for (i in sel_arr) {
        	  	var txt=(typeof sel_arr[i]=="string") ? sel_arr[i] : sel_arr[i].text;
        	  	var id=(typeof sel_arr[i]=="string") ? i : sel_arr[i].id;
        	  	var selected=(!sel_pos && i==0)||(""+id)==(""+sel_pos_loc);
        	  	this._InitSelectAddOption(sel_obj,txt,id,selected);
              //方法1
//              var opt = document.createElement("option");
//              opt.innerHTML = (typeof sel_arr[i]=="string") ? sel_arr[i] : sel_arr[i].text;
//              var id=(typeof sel_arr[i]=="string") ? i : sel_arr[i].id 
//              if (id)
//                  opt.setAttribute("value",id);
//              if ((!sel_pos && i==0)||(""+id)==(""+sel_pos_loc))
//                  opt.setAttribute("selected","selected");
//              sel_obj.append(opt)
          }
	          
      },
      
      _InitSelectAddOption :function(sel_obj,text,value,selected)
      {
    	  	//方法1
          var opt = document.createElement("option");
          opt.innerHTML = text
          opt.setAttribute("value",value);
          if (selected)
              opt.setAttribute("selected","selected");
          sel_obj.append(opt)
      },
      
      _SetDone:function(elem,act_str){
    	  	//do nothing
    	  	$(elem).attr(act_str+"_done","true")
      },
      
      _GetDone:function(elem,act_str){
    	  	if ($(elem).attr(act_str+"_done")=="true")
    	  		return true
    	  	else
    	  		return false;
      },
      
      //核心执行机构
      _Eval:function(eval_str ,is_return){
    	    var eval_str1;
    	    try{
    	  		if (this.errorLevel>0 && !this._CountStr_Check(eval_str,"{","}")){
    	  			if (this.errorLevel==1)
    	  				this._PUB_Error(this._PUB_Static.Str()+"{ *** }"+" not close!");
    	  			else
    	  				this._PUB_Error(this._PUB_Static.Str()+"{ *** }"+" not close!"+":\r\n"+eval_str);
    	  			return undefined;
    	  		}
    	  		var s=this._PUB_Static.Debug(eval_str,eval_str);//开始单步跟踪
				if (!is_return){//普通eval
						eval_str1=s;
						eval(eval_str1);
						return true;
				}else{//需要有返回值的eval
						var r="";
					eval_str1 = "r="+s;
					eval(eval_str1);
					return r;
				}
    	  	}catch(e){
    	  		if (this.errorLevel==1){//ly second
    	  			this._PUB_Error(this._PUB_Static.Str()+"Eval error:"+e.message);
              		throw ""
    	  		}	
    	  		else if (this.errorLevel==2){
    	  			this._PUB_Error(this._PUB_Static.Str()+"Eval error:"+e.message+":\r\n"+eval_str)
    	  		}else{
					console.error(this._PUB_Static.Str()+"Eval error:"+e.message+": "+eval_str)
				}
        	}
      },

      //功能: 计算域的执行,对于@函数,$(Field)的字段,@_Table,@Row的click_obj的转换,并执行
      //参数: sf:被换算和运行的字符串;add_fields:在换算的字符串中,可能出现的@_变量的值数组.obj:可能带有@Table,@Row的表单对象的属性,也将作为@_变量的值数组的补充
      _CountStr$ComplyAndEval:function(sf,is_return,af,is_check_field,no_check_then){
    	  var r="";
    	  	//compliy
        var s=this._CountStr$ToValue(sf,af,is_check_field)
        if (s==false)
		  	return undefined;

		//additons for then //ly_db
		if (!no_check_then){
			var s=this._CountStr$Then(s);
			if (s==null)
				return undefined;
	    }

        //run
        if (s){
        		if (is_return==false){
        			this._Eval(s);
        			return true;
        		}	
        		else{
        			r = this._Eval(s,true);
        			return r; //返回eval字串的运算结果.
        		}      			
        }	
        
	  },

	_CountStr$Then:function(src1,add_quot){
		var quot=add_quot ? add_quot : "\""
		if (src1==null)
			return null
		//var src=src1.trim();
		var src2=src1.replace(/(^\s+)|(\s+$)/g, "");//del \r \n \t space
		var src3 = src2.replace(/\r\n/g," ")
		var src = src3.replace(/\n/g," ")
		var pos1,dest="";
		var dest="";
		while((pos1=src.indexOf(")=>"))>=0){
			var part1=src.substr(0,pos1);
			var part_str=src.substr(pos1+3);
			var part2=this._CountStr$GetPart(part_str,"{","}");
			if (!part2){
				this._PUB_Error(this._PUB_Static.Str()+"Error: \"=>{ not close with } \" \r\n "+part_str+"");
				return null;
			}
			part2_tmp=(part2[1] && part2[1].trim()) ? part2[1].trim() : null;
			if (part2_tmp && (part2_tmp.charAt(0)!=';' && part2_tmp.charAt(0)!=')' && part2_tmp.charAt(0)!=':'  && part2_tmp.charAt(0)!=',') ){
				this._PUB_Error(this._PUB_Static.Str()+"Error: \"@***() must end with ';' or ')' \" \r\n "+part2[0]);
				return null;
			}
			//src=part1+","+quot+part2[0]+quot+") "+part2[1];
			dest+=part1+","+quot+part2[0]+quot+") ";
			src=part2[1];
		}
		return dest+src;
	},

	_CountStr$GetPart:function(src1,begin,end){//src should trim;
		var src=src1.trim(),r=[];
		if (src.indexOf(begin)!=0)
			return null;	
		var i=0,k=0,k1=0,k2=0;
		for(;k1=src.indexOf(begin,k),k2=src.indexOf(end,k);){
			if ((k1<0) && (k2 <0)){
				k=src.length;
				break;
			}
			if (k2<0) {
				k=k1;	i++;
			}else if (k1<0){
				k=k2;	i--;
			}else if (k1<k2){
				k=k1;	i++;
			}else{
				k=k2;	i--;
			}
			if (i==0)
				break;
			k++;
		}
		if(i!=0)
			return null; //false
		r[0]=src.substr(0,k+1); 
		r[1]=src.substr(k+1);
		return r;
	  },

      _CountStr$ToValue:function(strValue,add_fields,is_check_field){
        var af=add_fields;
        var do_check_field=is_check_field==false ? false: true;
        var local_this_obj=this.options.eval_global ? this.this_obj_base_str : "this"; //ly ht_obj_cb
        if (strValue=="")
        		return ""
        //如果有外部@变量数组，则替换操作
        if (af)
            for(var i=0; i<af.length; i++)
                strValue=this._PUB_ReplaceStr(strValue,af[i][0],af[i][1]);
        //not change mark
        var str_value = this._PUB_ReplaceStr(strValue,"__@","____-_-"); //对于@的字符特殊处理,不能算作@函数
 
		//0.replace {@_#fields}
		var str_value=this._CountStr_Replace(str_value,"{@_#","}",function(obj,field_str){ //cb_func this=windows, so you should input obj;
			if (!obj.options.$fields)
				return false;
			if (!do_check_field || (","+obj.options.$fields).indexOf(",#"+field_str)>=0 )
				return true
			else
				return false;
		},function(obj,field_str){
			//return string;
			return obj.options.$fields.split(',').indexOf("#"+field_str);
		})			
        if (str_value=="")
        	return false; //fail
		
        //1.replace {@_value}
        var str_value=this._CountStr_Replace(str_value,"{@_","}",function(obj,field_str){ //cb_func this=windows, so you should input obj;
        		if (!do_check_field || obj.options[field_str]!=undefined )
        		   return true
        		else
        		   return false;
        	},function(obj,field_str){
        		//return string;
        		return obj.options[field_str];
        })
        if (str_value=="")
        	return false; //fail
        
        //2.replace {@.}function
        var str_value= this._CountStr_Replace(str_value,"{@.","}",function(obj,field_str){
        		if (!do_check_field || obj.options[field_str.split(".")[0]]!=undefined )
              return true
            else
              return false;
          },function(obj,field_str){
              //return string;
            return local_this_obj+".options."+field_str;
          })
        if (str_value=="")
        	return false;
        
        //replace @***()function
        var str_value= this._CountStr_Replace(str_value,"@","(",function(obj,field_str){
        		//object must include field_func; and is upperCase;   
            if (obj.options["__"+field_str]!=undefined && field_str.toUpperCase()==field_str)
              return true
            else
              return false;
          },function(obj,field_str){
              //return string; 
            return local_this_obj+".options.__"+field_str+"("; //eval() running this is ht_obj;
          },true)
        if (str_value=="")
        		return false;
        
       //replace {$.***}object
        var str_value= this._CountStr_Replace(str_value,"{$.","}",function(obj,field_str){
            if (!do_check_field || obj._Chk$DATA(field_str)!=undefined)
              return true;
            else
              return false;
          },function(obj,field_str){
              return local_this_obj+"._Get$DATA('"+field_str+"')";
          })
        if (str_value=="")
            return false;

		//replace {$_***}object
		var str_value= this._CountStr_Replace(str_value,"{$_","}",function(obj,field_str){
            if (!do_check_field || obj._Chk$DATA(field_str)!=undefined)
              return true;
            else
              return false;
          },function(obj,field_str){
              return "JSON.stringify("+local_this_obj+"._Get$DATA('"+field_str+"')"+")";
          })
        if (str_value=="")
			return false;
          
        return this._PUB_ReplaceStr(str_value,"____-_-","@")  //恢复对于@的字符域的特殊处理.
      },
      
      //转换所有的$域增加.ht_value属性
      _CountStr_Replace : function(strValue,start,end,obj_test_func,obj_replace_func,err_skip){
  	    var eval_str="";
  	    var str_value=strValue;
        var i=0,j=0;
        while((i=str_value.indexOf(start)) >= 0){
      	    //step add result;
      	    eval_str += str_value.substr(0,i);
      	    
      		//cut field_str 
      	    var field_str=null;
      		j=str_value.indexOf(end,i);
      		if (j>0)
      			field_str= str_value.substr(i+start.length,j-(i+start.length)); 						
      		
      		//test field_str
      		if (!field_str || (obj_test_func && !obj_test_func(this,field_str))){
      			//if (1) not found end (2)field_str is not exited
      			if (err_skip==true){
      				eval_str+=str_value.substr(i,1); 
      				str_value=str_value.substr(i+1); 
      				continue;
      			}else{
      				this._PUB_Error(this._PUB_Static.Str()+start+field_str+end+" is not defined or syntax error! ")
      				return "";
      			}
      		}
      		//step add result； step cut source
      		eval_str += obj_replace_func(this,field_str);
      		str_value=str_value.substr(j+1);
  	    }
        eval_str+=str_value;
        return eval_str;
      },
      
      _GetCountFields : function(str_value){//ly_use
    	    var strValue=str_value;
        var $array = new Array();
        //var $array = new Object();
        while(strValue.indexOf("{$.",0) >= 0)
	  	  {
          //从 {$.开始 
          var tmp = strValue.substr(strValue.indexOf("{$.")+3,strValue.length);
          // 到}结束 ;
          var tmp1 = tmp.substr(0,tmp.indexOf("}"));
             
          if ($array[tmp1] == undefined || $array[tmp1] == null ){ 
              $array[tmp1]=new Array();
            }
          $array[tmp1]=1;
          //取其余的字串作下一步的抽取
          strValue = tmp.substr(tmp.indexOf("}")+1,tmp.length);
	  	  }
	  	  return $array
      },
 
      _CountStr_Check : function(strValue,start,end){
    	  	var i=0,start_num=0;
    	  	while((i=strValue.indexOf(start,i)) >= 0){
    	  		start_num++; //发现{
	    		i++;
    	  	};
    	  	i=0
    	  	while((i=strValue.indexOf(end,i)) >= 0){
    	  		start_num--; //发现{
	    		i++;
    	  	};
    	  	if (start_num!=0){
        		return false;
    	  	}
        return true;
	  },
	  
	  _PUB_IsNumber:function(){
		return   typeof obj=== 'number' && !isNaN(obj);
	  },
      
      _PUB_IsArray:function(value){
    	  	if (typeof Array.isArray === "function") {
	    		return Array.isArray(value);
	    	}else{
	    		return Object.prototype.toString.call(value) === "[object Array]";
	    }
      },
      
      _PUB_ArrObjAdd:function(src_obj,add_param_in,add_begin,add_end){
		var add_param=src_obj ? src_obj : []; //$.extend(true,{},src_obj)
		if (add_param_in!=null && add_param_in!=undefined){
			if (typeof add_param_in!='object'){
				add_param=add_param.concat([[add_begin+'0'+add_end,''+add_param_in]]);
			}else if (this._PUB_IsArray(add_param_in)){
				if (this._PUB_IsArray(add_param_in[0])){
					add_param=add_param.concat(add_param_in);	
				}else{
					for(i in add_param_in){
						add_param=add_param.concat([[(add_begin ? add_begin : "")+i+(add_end ? add_end : ""),add_param_in[i]]]);
					}
				}	
			}	
			else 
				for(a in add_param_in)
					add_param=add_param.concat([[(add_begin ? add_begin : "")+a+(add_end ? add_end : ""),add_param_in[a]]]);
		}
		return add_param;
	  },
	  
      _PUB_ArrStrToPath:function(src_arr_str,add){
		var src_arr=src_arr_str.split("[");
		var dest="";
		var add_part=src_arr[0];
		for (var i=1; i<src_arr.length; i++){
			add_part+="["+src_arr[i];
			if (i<(src_arr.length-1))
				dest+=add_part+add;
			else
				dest+=add_part;
		}
		return dest;
	  },
	  
	   _PUB_DownLoadToLocal: function(url,save_file_name){
			//full_url = window.location.protocol +"//"+ window.location.host+url;
			full_url = this.options.$http_protocol +"//"+ this.options.$http_host+url;
			
			//弹出一个IE窗口,并操作execCommand-"另存"IE所打开的内容.
			var a=window.open(full_url,"_blank");   
			//a.document.execCommand("SaveAs",false,save_file_name);
			//a.close();
		},
	  
      _PUB_SendAjax: function(src_obj,params,suc_func,err_func,debug_str) {//src_obj.options={type:'post',url:'****',data:{??},headers{'head_name':'head value'}}
	    if (!params.url)
	      this._PUB_Error(this._PUB_Static.Str()+"ajax src_obj.options url not exited!") //url必须设置
	
	    var d =null;
	    if (params.sendData) 
	        d={dataJson : typeof params.sendData=="string"? params.sendData : JSON.stringify(params.sendData)};  
	
		//alert(''+params.method+' '+params.data_type);
	    $.ajax({
	      type : params.method ? params.method : "get",
	      url : this._PUB_HTTP_URL(params.url),
	      dataType :params.data_type ? params.data_type : "json",
	      data : d,
	      headers : params.headers ? params.headers : null,
	      timeout : params.timeout ? params.timeout :50000,
	      cache : false,
	      success : function(data) {
	    	  		if (debug_str)
	    	  			src_obj._PUB_Static.Push(debug_str);
	    	  		if (data[0] && data[0]=="error"){
	    	  			if (err_func)
	    	  				err_func.call(src_obj,data[1]);
	    	  			else{
	    	  				if (src_obj.errorLevel>=1)
	    	  					src_obj._PUB_Error(src_obj._PUB_Static.Str()+"SQL ERROR: "+data[1]);
	        	  			else
	        	  				console.error("sql error: "+data[1])
	    	  			}	
	    	  		}else if (suc_func){
	    	  			try{
	    	  				suc_func.call(src_obj,data);
	    	  			}catch(e){
	    	  				if (src_obj.errorLevel>=1)
	    		  				src_obj._PUB_Error(src_obj._PUB_Static.Str()+"RESULT_EVAL() ERROR: "+e);
	    	    	  			else
	    	    	  				console.error("result_eval() error: "+e);
	    	  			}
	    	  		}
	    	  			
	    	  		src_obj._PUB_Static.Pop(); 
	      },
	      error : function(e) {
	    	  		 if (debug_str)
	    	  			src_obj._PUB_Static.Push(debug_str);
	    	 	     if (err_func)
	      			err_func.call(src_obj,e);
	      		else{
	      			if (src_obj.errorLevel>=1){
	      				src_obj._PUB_Error(src_obj._PUB_Static.Str()+"AJAX ERROR:(network "+e.statusText+" "+e.status+") "+e.responseText? e.responseText : "");	
	      			}else
	    	  			console.log("ajax error: ("+e.statusText+") "+e.responseText);
	      		}
	      		src_obj._PUB_Static.Pop();
	      }
	    });
	  },

//      _PUB_RandomStr: function(fcontent,oldstr,newstr){
//        //替换处理
//          var var1 = oldstr;
//          if (typeof oldstr=="object"){
//              for(var i=0; i<oldstr.length; i++){
//                  fcontent = this._PUB_ReplaceStr(fcontent,oldstr[i][0],oldstr[i][1])
//              }
//          }else{
//              fcontent = this._PUB_ReplaceStr(fcontent,oldstr,newstr)
//          }
//          return fcontent    
//        },
      
      _PUB_ReplaceStr: function(fcontent,oldstr,newstr){
          //替换处理
            var var1 = oldstr;
            
            //替换
            var rr= new RegExp(var1,"gi");
            fcontent = fcontent.replace(rr,newstr);
            return fcontent;
      },
      
      _PUB_HTTP_URL : function(url) {
        if (url.indexOf("http") != 0) {
          url = this.options.$http_protocol + '//' + this.options.$http_host+ "/" + url
        }
        return url;
	  },

	  _PUB_hex_str_to_ascii:function(hexStr) {
			var str = "";
			if (hexStr.substr(0, 2) == "0x")
				hexStr = hexStr.substr(2);
			for (var i = 0; i < hexStr.length; i += 2) {
				try {
					var t = parseInt(hexStr[i] + hexStr[i + 1], 16);
					if (t > 0 && t != 0xff)
						str += String.fromCharCode(t);
				}
				catch (e) {
					console.log(e);
				}
			}
			str = str.replace('<', '&lt;');
			str = str.replace('>', '&gt;');
			str = str.replace('\'', ' ');
			str = str.replace('\"', ' ');
		
			return str;
		},
		
		_PUB_ascii_to_hex_str:function(ascciStr) {
			var str = "";
			for (var i = 0; i < ascciStr.length; ++i) {
				str += ascciStr.charCodeAt(i).toString(16);
			}   
			return str;
		},
		
		PUB_decimal_to_hex:function(n) {
			var str = n.toString(16);
			if (str.length % 2 != 0) str = "0" + str;
			return str;
		},
      
      _PUB_Error:function(str,add_err_str){
        var err_str = ""
        if (add_err_str)
            err_str = str+add_err_str
        else
		  	err_str = str
		if(this.options.$err_call){
			if (typeof this.options.$err_call=="string"){
				this._CountStr$ComplyAndEval("var err_str=\""+err_str+"\";"+this.options.$err_call,false);
			}
			else
				this.options.$err_call.call(this.options,str,add_err_str);
		}

			
		else
        	alert(err_str);
//        if (PUB_IsTest )  
//              alert(temp1111111);
      },
      _PUB_Static: {
    		    noteStr:"",
    		    insStr:new Array(),
    		    showStep:false,
    		    
    		    Clear:function(){
    		        this.noteStr = ""
    		    },
    		    Add:function(step_str){
    		        this.noteStr = this.noteStr+step_str+"->"
    		    },
    		    Replace:function(step_str){
    		        var str1 = this.noteStr.substring(0,this.noteStr.length-2)
    		        this.noteStr = str1.substring(0,str1.lastIndexOf("->")+2)+step_str+"->"
    		    },
    		    
    		    NewPush:function(step_str){
    		        this.insStr=new Array()
    		        this.insStr.push(step_str?step_str:"")
    		    },
    		    
    		    Push:function(step_str){
    		    		if (step_str==null)
    		    			var i=0
    		        this.insStr.push(step_str)
    		        if (this.showStep)
    		            this.Debug("DEBUG")   
    		    },
    		    
    		    Pop:function(){
    		        this.insStr.pop();
    		    },
    		    
    		    Str:function(str){
    		        var show_str = this.noteStr
    		        if (this.insStr)
    		            for(var i=0;i<this.insStr.length;i++)
    		                show_str = show_str+this.insStr[i]+"->"     
    		        return show_str+(str?str:"");
    		    },
    		    
    		    Debug:function(src,note_str){
    		        var DEBUG = false;
    		    	if (src.split("DEBUG").length==2){
    			        var src1 = src.split("DEBUG")[0]+src.split("DEBUG")[1]
    			        if (window.confirm(this.Str(note_str)+"需要DEBUG吗???"))
    		                var DEBUG=true
    		            return src1  //VISION-STDUIO DEBUG点,条件:'DEBUG=true'
    			    }else{
    			        return src
    			    }
    		    },
    		    
    		    SetStepDebug:function(){
    		        this.showStep=true;
    		    },
    		    ClearStepDebug:function(){
    		        this.showStep=false;
    		    }
    		},
     
	    _PUB_RandomStr : function(strLength)
	    {
	        var str="1234567890poiuytrewqasdfghjklmnbvcxzQWERTYUIOPLKJHGFDSAZXCVBNM";
	        var tmpStr="";
	        for(var i=0;i< strLength;i++) 
	        {
	          tmpStr += str.charAt(Math.floor(Math.random()*51));
	        }
	        return tmpStr;
	    },
	    
	    _PUB_GetObjType:function(data){
	    		return Object.prototype.toString.call(data).split(' ')[1].slice(0, -1)
	    },
	    options_ext:{
	    	__TEST:function(p1,p2,p3){
				var i=0;
				return p1;
	    	},
			__SUM : function(arr,type){//sum_str as @SUM(Cart.*.Total)
		  		var sum=0;
		  		if (type=="string")
		  			sum="";
		  		for(var i=0; i<arr.length; i++){
		  			if(arr[i]==undefined){
		  				this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@SUM(array) array["+i+"] not exited! ");
		  				break;
		  			}
		  			if (type=="string"){
		  				sum+=arr[i];//for string add
		  			}else{//for number add
		  				if (typeof arr[i]=="number"){
		  					sum+=arr[i];
		  				}else{
			  				var cell;
			  				if (type=="Integer")
			  					cell=parseInt(arr[i]);
			  				else
			  					cell=parseFloat(arr[i])
				  			if (isNaN(cell)){
				  				sum+=cell;
				  			}
		  				}
		  				
		  			}		
		  		}
		  		return sum;
		  	}, 
		    
		  	__SHOW:function(param,div){
		  		this.__parentObj._Show(param,div);
		  	},
		  	
		  	__SET:function(src_obj,value){
		  		this.__parentObj.options[src_obj]=value;
			},

			__ALERT:function(e){
				alert(e);
			},

		    __VERIFY:function(cb,div,do_retry){
		    		var this_div=div ? $('#'+div): this.__parentObj.$elem ;
			    	var items=this_div.find("[ht_verify]");
		    		for (var i=0; i<items.length; i++){
		    			var tmp=$(items[i]).attr("ht_bind")
		    			if ((tmp && this.$Verify[tmp]==undefined) || do_retry)
		    				this.__parentObj._VerifyField($(items[i]));
		    		}
		    		//
		    		for(a in this.$Verify){
		    			var r=this.$Verify[a];
		    			if (r){
		    				if (cb)
		    					cb(r)
		    				else
		    					alert(r);
		    				return false;
		    			}
		    		}
		    		return true;
		    },
		    
		  	__LOAD:function(){
		  		this.__parentObj.Load();
			  },

			__RELOAD:function(cfg){
				// if (typeof cfg=="string"){
				// 	//加入options ? 可去除
				// 	var cfg_obj=this._CountStr$ComplyAndEval("{"+ht_cfg_str+"}",true);
				// 	if (cfg_ob){
				// 		if (typeof cfg_ob=="object" && !this.__parentObj._PUB_IsArray(cfg_ob))
				// 			$.extend(this.__parentObj.cfg_ob,cfg_ob);
				// 		else{
				// 			this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"RELOAD() param must be option :List:***,Model:*** !");
				// 			return;
				// 		}		
				// 	}
				// 	//加入Data数据
				// 	this.__parentObj.Load();
				// }else
					this.__parentObj.Load(cfg);
			},
		  	__AND : function(and_array){
		  	    var t = true
		  	    if (typeof add_array=="object")
		  	        for(var i=0; i<and_array.length; i++){  
		  	            t = t && and_array[i]
		  	        }
		  	    else{
		  	        for(var i=0; i<arguments.length; i++){
		  	            t = t && arguments[i]
		  	        }
		  	    }
		  	    return t
		    },
		    
		  	__DO : function(or_array){
		  	    var t = false;
			  },
			
			__ENCODE_JURL : function(obj){
				var tmp=JSON.stringify(obj)
				var tmp2= this.__parentObj._PUB_ReplaceStr(tmp,"#","&#35;")
				return tmp2;
			}, 
	
		  	__OR : function(or_array){
		  	    var t = false
		  	    if (arguments.length==1 &&typeof or_array=="object")
		  	        for(var i=0; i<or_array.length; i++){  
		  	            t = t || or_array[i]
		  	        }
		  	    else{
		  	    	for(var i=0; i<arguments.length; i++){
		  	            t = t || arguments[i]
		  	        }
		  	    }
		  	    return t
		  	},
		  	
		  	__RANDOM:function(long){//改为和DATA_DEL\DATA_GET同步支持Table[src_id]=value操作。
			  	return this.__parentObj._PUB_RandomStr(long)
		    },
	
		  	__NOW : function(str,str2,split){
		  	    if (!split)
		  	        var split="-"
		  	    if (str2=="NoYear")
		  	        year =  '';
		  	    else
		  	        var year=(new Date()).getYear()+ split;
		  	        
		  	    if (str=="Date")
		  	        return year+PUB_NumToID((new Date()).getMonth()+1,2)+split+PUB_NumToID((new Date()).getDate(),2);
		  	    else if(str=="Minutes")
		  	        return year+PUB_NumToID((new Date()).getMonth()+1,2)+split+(new Date()).getDate()+" "+(new Date()).getHours()+":"+(new Date()).getMinutes();
		  	    else
		  	      return year+PUB_NumToID((new Date()).getMonth()+1,2)+split+(new Date()).getDate()+" "+(new Date()).getHours()+":"+(new Date()).getMinutes()+":"+(new Date()).getSeconds();
			  },
		  __OPTIONS_SET:function(opt_name,value){
			this[opt_name]=value;
			return value;
		  },
		  
		  __DATA_DEL:function(src,src_id){
			  if (src_id==undefined){
				  this.__parentObj._Del$DATA.call(this.__parentObj,src)
			  }  
			  else{
				  var table_name=src;
				  if (!this.$DATA[table_name]||!this.$DATA[table_name][src_id]){
						this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DATA_DEL("+src+","+src_id+") object not exited!");
						return null;
				  }
				  this.$DATA[src].splice(src_id,1);
			  }
		    },
		    
		  __ITEM_SET:function(obj,value){
			  if (typeof obj=="object"){//normal obj
				  $(obj).val(value).trigger('onchange');
			  }  
			  else {
				  if (obj.indexOf('#')==0){//jquery obj
					  $("#"+obj).val(value).trigger('onchange'); 
				  }else{//ht_bind_obj
					  var items=this.__parentObj.$elem.find("[ht_bind='"+obj+"']");
					  if (items.length==0)
						  return undefined;
			  	  	  var obj=items[0];
			  	  	  $(obj).val(value).trigger('onchange');
				  }	  		
			  }	  
		  },
		  
		  __COUNT:function(bind_obj_id){
			  this.__parentObj._CountField(bind_obj_id,this.countMax); 	  
		  },
		  
		  __COUNT_ALL:function(){
			  this.__parentObj._CountAllField(this.countMax) 	  
		  },
		  
		  __CHANGED:function(src1,dest,arr){
			  if (!src1 || !dest){
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@CHANGED(src,dest,arr) src("+src1+") or dest("+dest+") not exited!");
					return null;
			  }
			  var src;
			  if (typeof src1=="string"){
				  src=this.__parentObj._Get$DATA.call(this.__parentObj,src1);
			  }
			  if (!src){
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@CHANGED(src,dest,arr) src("+src1+") not exited!");
					return null;
			  }
			  if (typeof src!="object" || typeof dest!="object"){
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@CHANGED(src,dest,arr) src("+src1+") or dest("+dest+") not object!");
					return null;
			  }
			  if (arr && typeof arr!="string"){
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@CHANGED(src,dest,arr) arr("+arr+") should be '***,***,***'!");
					return null;
			  }else
				  
			  var arr_obj=arr ? arr.split(',') : null;
			  for(a in src){
				  if (arr_obj && !(arr_obj[a]))
					  continue;
				  if (src[a]!=dest[a])
					  return true;
			  }
			  return false;
		  },
		  
		  __DATA_GET:function(src,src_id){
			  if (src_id==undefined){
				  return this.__parentObj._Get$DATA.call(this.__parentObj,src)
			  } else{
			  	var table_name=src;
				if (!this.$DATA[table_name]||!this.$DATA[table_name][src_id]){
						this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DATA_GET("+src+","+src_id+") object not exited!");
						return null;
				}
		  		return this.$DATA[table_name][src_id];
			  }
		  },
		    
		  __DATA_SET:function(src_id,value,add_params){//改为和DATA_DEL\DATA_GET同步支持Table[src_id]=value操作。
			  	this.__parentObj._PUB_Static.Push("@DATA_SET");
		  		this.__parentObj._Set$DATA.call(this.__parentObj,src_id,value,add_params);
		  		this.__parentObj._PUB_Static.Pop()
			},
			
		  /*__STO_SET:function(vals,storage_type){
			  for (a in vals){
				  if (!storage_type && storage_type=="LOCAL"){
					   this.$STO[a]=vals[a];
					   var tmp=windows.localStorage.getItem("a");
					   if (tmp && tmp!='')
					   		windows.localStorage.removeItem("a");
					   window.localStorage.setItem(a,JSON.stringify(vals[a]));
				  }
			  }
		  },
		  	
			__STO_LOAD:function(vals_str){
				var vals=vals_str.split(",");
				for (a in vals){
					this.$STO[a]=windows.localStorage.getItem("a");
				}
			},*/

			__GB_CFG:function(cfg){
				$.extend(this.$GB.cfg,cfg);
			},
			__GB_SET:function(key,vals){
				if (typeof key=="string"){
					this.__STO_SET(key,vals,'SESSION');
					this.$GB.key=vals; //sync for debug
				}
				else if (typeof(key)=="object"){
					for(a in key){
						this.__STO_SET(a,key[a],'SESSION');
						this.$GB[a]=key[a]//for debug
					}
				}
			},
			__GB_GET:function(key){
				this.$GB[key]=this.__STO_GET(key,'SESSION');
				return this.$GB[key]//for debug
			},

			__STO_SET:function(key,vals,storage_type){
				if (!storage_type || storage_type=="LOCAL"){
					//设置
					if(!vals || vals=='')
						window.localStorage.removeItem(key);
					else
						window.localStorage.setItem(key,JSON.stringify(vals));
				}else if (storage_type=="SESSION"){
					if(!vals || vals=='')
						sessionStorage.removeItem(key);
					else
						sessionStorage.setItem(key,JSON.stringify(vals));
				}
				else
					console.error("__STO_SET("+storage_type+") not support!");
			},

			__STO_GET:function(key,storage_type){
				var vals;
				if (!storage_type || storage_type=="LOCAL"){
					vals=window.localStorage.getItem(key);
				}else if (storage_type=="SESSION"){
					vals=sessionStorage.getItem(key);
				}
				else{
					console.error("__STO_GET("+storage_type+") not support!");
					return null;
				}
				//
				if (vals && vals!=''){
						return JSON.parse(vals);
				}else
					return null;
			},

			__STO_SAVE_$DATA:function(objs_str,storage_type){
				var key="HT_OBJ_STO";
				var objs=objs_str.split(",");
				var sto_obj={};
				for(var i=0; i<objs.length; i++){
					sto_obj[objs[i]]=this.$DATA[objs[i]];
				}
				this.__STO_SET(key,sto_obj,storage_type);
			},	

			__STO_LOAD_$DATA:function(objs_str,storage_type){
				var key="HT_OBJ_STO";
				var sto_obj=this.__STO_GET(key,storage_type);
				if (sto_obj){
					for (a in sto_obj){
						if (objs_str && (objs_str+",").indexOf(a+",")<0)
							continue;
						this.$DATA[a]=sto_obj[a];
					}		
				}	
			},
			__STO_SAVE:function(objs,storage_type){
				var key="HT_OBJ_STO";
				var sto_obj={};
				for(a  in objs){
					sto_obj[a]=objs[a];
				}
				this.__STO_SET(key,sto_obj,storage_type);
			},	

			__STO_LOAD:function(objs_str,storage_type){
				var key="HT_OBJ_STO";
				var sto_obj=this.__STO_GET(key,storage_type);
				var objs={};
				if (sto_obj){
					for (a in sto_obj){
						if (objs_str && (objs_str+",").indexOf(a+",")<0)
							continue;
						objs[a]=sto_obj[a];
					}		
				}	
			},

		  __ARRAY_SPLIT:function(src_arr,step){//改为和DATA_DEL\DATA_GET同步支持Table[src_id]=value操作。
			  	this.__parentObj._PUB_Static.Push("@ARRAY_SPLIT");
			  	if (!this__IS_ARRAY(src_arr)){
	  				this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@ARRAY_SPLIT(src),src is not array ");
					return null;
	  			}
			  	var new_array=[];
		  		for(var i=0; i<src_arr.length; i++){
		  			if ((i % step)==0){
		  				new_array[i/step]=[];
		  			}
		  			new_array[i/step][i%step]=src_arr[i];
		  		}
		  		this.__parentObj._PUB_Static.Pop()
			},
			
			__HEX2CHR:function(src,pos){
				if (typeof src=="string"){
					return this.__parentObj._PUB_hex_str_to_ascii(src);
				}else if (typeof src=="object"){
					for(var i=0; i<src.length; i++){
						src[i][pos]=this.__parentObj._PUB_hex_str_to_ascii(src[i][pos]);
					}
					return src;
				}
			},
		    
		    __ARRAY_OBJ:function(src_arr,key,is_deep,son_type){
				//改为和DATA_DEL\DATA_GET同步支持Table[src_id]=value操作。
				if (!son_type || son_type=="object"){
					//key：有字串，son_type缺省为object; 则为:{key:{son_object}}；key为（son_object 中提取。
					var new_obj={};
					for(var i=0; i<src_arr.length; i++){
						var item=src_arr[i];
						new_obj[item[key]]=item;
						if (is_deep && item.children && item.children.length>0 )
							item.children=this.__ARRAY_OBJ(item.children,key,is_deep);
						else
							item.children={}	
					}
					return new_obj;
				}else if (son_type=="array"){
					//key: fields，son_type==arrays; 则为:[{key0:son[0],key1:son[1]}]
					var new_obj=[];
					var fields=key.split(",");
					var types=[];
					//解析types
					for(var i=0; i<fields.length; i++){
						if (fields[i].indexOf(":")>0){
							types[i]=fields[i].split(":")[1];
							fields[i]= fields[i].split(":")[0];
						}else
							types[i]="";		
					}
					//循环处理数组
					for(var i=0; i<src_arr.length; i++){
						//转换字段域
						new_obj[i]={};
						for(j=0; j<fields.length;j++){
							if (types[j]=="int"){//整数类型
								new_obj[i][fields[j]]=parseInt(src_arr[i][j]);
							}else if(types[j]=="char"){
								new_obj[i][fields[j]]=this.__parentObj._PUB_hex_str_to_ascii(src_arr[i][j]);
							}else
								new_obj[i][fields[j]]=src_arr[i][j];
						}
						if (is_deep && new_obj[i].children && new_obj[i].children.length>0 )
							new_obj[i].children=this.__ARRAY_OBJ(new_obj[i].children,key,is_deep,son_type);
						else
							new_obj[i].children=[];		
					}
					return new_obj;
				}	
			},
			
			__OBJ_ARRAY:function(src_obj,type){//改为和DATA_DEL\DATA_GET同步支持Table[src_id]=value操作。
				if (type.indexOf("PUT")>=0){
					var arr_key="";
					var arr_val=[]
					for(a in src_obj){
						arr_key+='#'+a+',';
						arr_val.push(src_obj[a]);
					}
					if (arr_key.length!=0)
						arr_key=arr_key.substr(0,arr_key.length-1);
					return [arr_key,arr_val];
				}
				alert('@OBJ_ARRAY() not support!')
		  },
		    
		    __EVAL:function(ht_show_str,add_param_in){
		  		//this.__parentObj._Show(param);
		    		var add_param=add_param_in? add_param_in : [];
		    		add_param=add_param.concat([["{@_THIS_OBJ}",this.__parentObj.this_obj_str]]);
		  		this.__parentObj._PUB_Static.Push("@EVAL")
			  	var rt_value=this.__parentObj._CountStr$ComplyAndEval(ht_show_str,false,add_param);//count and act;
			  	//if (rt_value)
			  			//this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"Load script error",ht_show_str);
			  	this.__parentObj._PUB_Static.Pop()
			  	return rt_value;
		  	},
		    
		    /*__EVAL_NEXT:function(param){
		  		//this.__parentObj._Show(param);
		  		var ht_show_str;
		  		if ((ht_show_str=$(this.__parentObj.$elem).attr(param))){
			  		//user defined ht_load
			  		this.__parentObj._PUB_Static.Push("@EVAL_NEXT")
			  		var rt_value=this.__parentObj._CountStr$ComplyAndEval(ht_show_str,false,[["{@_THIS_OBJ}",this.__parentObj.this_obj_str]],false);//count and act;
			  		if (!rt_value)
			  			this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"Load script error",ht_show_str);
			  		this.__parentObj._PUB_Static.Pop()
			  	}
			  },*/
			__CHECK_TIME_OUT:function(){
				if (this.$time_out_call)
					return this['$time_out_call'].call(this);
				else
					return fasle;
			},
			__CALL:function(func_name,add_param_in){
				if (func_name.indexOf("@.") == 0){//ly add2
					if (!this[func_name.substr(2)]) 
						return;
					return this[func_name.substr(2)].call(this, add_param_in);
				}else{
					if (func_name.indexOf("ht_")==0 && this[func_name]){
						return this[func_name].call(this, add_param_in);
					}else
						return this.__EVAL_NEXT(func_name,add_param_in);
				}
					
			},

		    __EVAL_NEXT:function(param,add_param_in){
		  		//this.__parentObj._Show(param);
		  		var ht_show_str;
		  		if ((ht_show_str=$(this.__parentObj.$elem).attr(param))){
			  		//ly ht_obj_cb
			  		this.__parentObj._PUB_Static.Push("@EVAL_NEXT");
//			  		var add_param=add_param_in? add_param_in : [];
//			  		add_param=add_param.concat([["{@_THIS_OBJ}",this.__parentObj.this_obj_str]]); 
//			  		var add_param=[];
//					if (add_param_in){
//						if (this.parentObj.PUB_IsArray(add_param_in))
//							add_param=add_param_in;
//						else 
//							for(a in add_param_in){
//								add_param=add_param.concat([["{@_PARAM_"+a+"}",add_param_in[a]]]);
//							}
//					}
			  		var add_param=this.__parentObj._PUB_ArrObjAdd([["{@_THIS_OBJ}",this.__parentObj.this_obj_str]],add_param_in,"{@_PARAM_","}")
			  		//do eval
			  		var rt_value=this.__parentObj._CountStr$ComplyAndEval(ht_show_str,false,add_param,false);//count and act;
			  		if (!rt_value)
			  			this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"Load script error",ht_show_str);
			  		this.__parentObj._PUB_Static.Pop()
			  	}else{
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"attr '"+param+"' not exited!"); 
				}
		  	},

		    __EVAL_NODE:function(node_id,attr_str,param){
		    		//get node;
		    		var node=node_id
		    		if (typeof node_id=="string"){
		    			var nodes=this.__parentObj.$elem.find("[id='"+node_id+"']");
			    		if (nodes.length<=0){
							this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@EVAL_NODE('"+node_id+"','"+attr_str+"') param1->node_id not exited!");
							return null;
					}
			    		node=(nodes[0]);
		    		}
		    		//get attr string
		    		var attr=$(node).attr(attr_str);
		    		if (!attr){
						this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@EVAL_NODE('"+node_id+"','"+attr_str+"') param2->attr not exited!");
						return null;
				}
		    		//eval
		    		//this.__parentObj._CountStr$ComplyAndEval(attr);
		    		this.__parentObj._PUB_Static.Push("@EVAL_NODE");
		    		var rt_value=this.__parentObj._CountStr$ComplyAndEval(attr,false,[["{@_THIS_OBJ}",this.__parentObj.this_obj_str],["{@_EVAL_NODE_PARAM1}",param]],false);//count and act;
			  	if (!rt_value)
			  			this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+" Load script error:",attr);
			  	this.__parentObj._PUB_Static.Pop();
		    },
		    
		    __IS_ARRAY:function(value){
			   if (typeof Array.isArray === "function") {
			    		return Array.isArray(value);
			    	}else{
			    		return Object.prototype.toString.call(value) === "[object Array]";
			    }
			},
		  
		  __DB_NEW : function(table_name_in,db_type_class,fields_list,id_name){
			  //name split
			  var name=table_name_in.split(":");
			  var table_name=table_name_in,table_name_sql=table_name_in;
			  if (name.length>1){
					table_name_sql=name[1];
					table_name=name[0]
			  }
			  //
			  var db_obj={}; 
			  if (window[db_type_class])
				  db_obj=new window[db_type_class](table_name,this.__parentObj,fields_list,id_name);
			  else{
				this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_NEW(table_name,type) "+db_type_class+" is not supported! ");
				return null;
			  }  
			  this.$DB[table_name] = $.extend({table_sql:table_name_sql}, db_obj);
		  },

		  __DB_GET : function(table_name,conditions,param_obj,then_act){
			//user defined ht_load
			if (!this.$DB[table_name]){
				this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_GET() table_name("+table_name+") is not set!");
				return null;
			}
			if (!this.$DB[table_name].get){
				this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_GET(table_name,[page_num,page_size]) .get() is not set!");
				return null;
			}
			var params;
			if (typeof param_obj == "string")
				params=param_obj.split(",")
			else if (typeof param_obj == "number")
				params=[param_obj]
			else
				params=param_obj;
			
			//get conditions
			var condition=null,order=null;
			if (typeof conditions == "string")
				condition=conditions
			else if (this.__IS_ARRAY(conditions)){
				condition=conditions[0];
				order=conditions[1];
			}
			
			if (params[0]==null){
				this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_GET(table_name,[page_num,page_size]) 'page_num' or 'page_size' should be set!");
				return null;
			}
			var rt_value=this.__parentObj._CountStr$ComplyAndEval.call(this.__parentObj,this.$DB[table_name].get,false,[
				["{@_PAGE_NUM}",params.length==1 ? "1" : params[0]],
				["{@_PAGE_SIZE}",params.length==1 ? params[0] : params[1]],
				["{@_ADD_PARAMS}",params[2]],
				["{@_CONDITIONS}",!condition ? "1%3d1" : condition],
				["{@_ORDER}",!order ? "" : order],
				["{@_DEBUG}","__@DB_GET(AJAX)"],
				["{@_TABLE_NAME}",table_name],
				["{@_TABLE_NAME_SQL}",this.$DB[table_name].table_sql],
				["{@_THEN_ACT}",!then_act? "" : then_act]]);//count and act;
		  },
		  
		  __REPLACE:function(src,old,new_str){
			  return this.__parentObj._PUB_ReplaceStr(src,old,new_str);
		  },

		  __DB_DEL : function(table_name,id,then_act){
			if (!this.$DB[table_name]||!this.$DB[table_name].get){
				this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_DEL(table_name,id) table_name is not set!");
				return null;
			}
			if (!id){
				this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_DEL(table_name,id) id is not set");
				return null;
			}  
			//user defined ht_load
			this.__parentObj._PUB_Static.Push("@DB_DEL");
			var rt_value=this.__parentObj._CountStr$ComplyAndEval.call(this.__parentObj,this.$DB[table_name].del,false,[
				["{@_DEBUG}","__@DB_DEL(AJAX)"],
				["{@_REC_ID}",id],
				["{@_TABLE_NAME}",table_name],
				["{@_TABLE_NAME_SQL}",this.$DB[table_name].table_sql],
				["{@_THEN_ACT}",!then_act? "" : then_act]]);//count and act;
			this.__parentObj._PUB_Static.Pop()
		  },
		  
		  __DB_DEL_EXT : function(table_name,id,ext_act,then_act){
				if (!this.$DB[table_name]||!this.$DB[table_name].get){
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_DEL(table_name,id) table_name is not set!");
					return null;
				}
				if (!id){
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_DEL(table_name,id) id is not set");
					return null;
				}  
				//user defined ht_load
				this.__parentObj._PUB_Static.Push("@DB_DEL");
				var rt_value=this.__parentObj._CountStr$ComplyAndEval.call(this.__parentObj,this.$DB[table_name].del_ext,false,[
					["{@_DEBUG}","__@DB_DEL(AJAX)"],
					["{@_REC_ID}",id],
					["{@_EXT_ACT}",ext_act ? encodeURIComponent(JSON.stringify(ext_act)) : "" ],
					["{@_TABLE_NAME}",table_name],
					["{@_TABLE_NAME_SQL}",this.$DB[table_name].table_sql],
					["{@_THEN_ACT}",!then_act? "" : then_act]]);//count and act;
				this.__parentObj._PUB_Static.Pop()
			  },
			  
		  __DB_SET : function(table_name,data_str,then_act){
			//
			if (!this.$DB[table_name]||!this.$DB[table_name].get){
				this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_SET(table_name,num) "+table_name+" is not set!");
				return null;
			}
			if (data_str==null){
				this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_SET(table_name,data) data is not set");
				return null;
			} 
			var id=(typeof(data_str)=="object" && data_str.length>0 &&  this.$DB[table_name].id_name ) ? data_str[0][this.$DB[table_name].id_name] : "";
			//user defined ht_load
			this.__parentObj._PUB_Static.Push("@DB_SET")
			var rt_value=this.__parentObj._CountStr$ComplyAndEval.call(this.__parentObj,this.$DB[table_name].set,false,[
				["{@_REC_DATA}",typeof data_str=="string" ? data_str : JSON.stringify(data_str)],
				["{@_REC_ID}",(!id || id==undefined)? "" : id],
				["{@_DEBUG}","__@DB_SET(AJAX)"],
				["{@_TABLE_NAME}",table_name],
				["{@_TABLE_NAME_SQL}",this.$DB[table_name].table_sql],
				["{@_THEN_ACT}",!then_act? "" : then_act]]);//count and act;
			this.__parentObj._PUB_Static.Pop()
			return 1;
		  },
		  
		  __DB_SET_ALL : function(table_name,data_str,then_act){
				//
				if (!this.$DB[table_name]||!this.$DB[table_name].get){
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_SET(table_name,num) "+table_name+" is not set!");
					return null;
				}
				if (data_str==null){
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_SET(table_name,data) data is not set");
					return null;
				} 
				if (data_str.indexOf("[")!=0 || !this.__IS_ARRAY(data_str)){
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_SET(table_name,data) data must be array");
					return null;
				}
				//user defined ht_load
				this.__parentObj._PUB_Static.Push("@DB_SET")
				var rt_value=this.__parentObj._CountStr$ComplyAndEval.call(this.__parentObj,this.$DB[table_name].set,false,[
					["{@_REC_DATA}",typeof data_str=="string" ? data_str : JSON.stringify(data_str)],
//					["{@_REC_ID}",!id ? "" : id],
					["{@_DEBUG}","__@DB_SET(AJAX)"],
					["{@_TABLE_NAME}",table_name],
					["{@_TABLE_NAME_SQL}",this.$DB[table_name].table_sql],
					["{@_THEN_ACT}",!then_act? "" : then_act]]);//count and act;
				this.__parentObj._PUB_Static.Pop()
				return 1;
			  },
		  
		  __DB_SET_EXT : function(table_name,data_str,ext_act,then_act){
			//
			if (!this.$DB[table_name]||!this.$DB[table_name].get){
				this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_SET(table_name,num) "+table_name+" is not set!");
				return null;
			}
			if (data_str==null){
				this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_SET(table_name,data) data is not set");
				return null;
			} 
			//user defined ht_load
			this.__parentObj._PUB_Static.Push("@DB_SET")
			var rt_value=this.__parentObj._CountStr$ComplyAndEval.call(this.__parentObj,this.$DB[table_name].set_ext,false,[
				["{@_REC_DATA}",typeof data_str=="string" ? data_str : JSON.stringify(data_str)],
				["{@_EXT_ACT}",ext_act ? encodeURIComponent(JSON.stringify(ext_act)) : "" ],
				["{@_DEBUG}","__@DB_SET(AJAX)"],
				["{@_TABLE_NAME}",table_name],
				["{@_TABLE_NAME_SQL}",this.$DB[table_name].table_sql],
				["{@_THEN_ACT}",!then_act? "" : then_act]]);//count and act;
			this.__parentObj._PUB_Static.Pop()
		  },
		  
//		  __DB_SET_ALL : function(table_name,data_str,ext_act,then_act){
//			//
//			if (!this.$DB[table_name]||!this.$DB[table_name].get){
//				this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_SET(table_name,num) "+table_name+" is not set!");
//				return null;
//			}
//			if (data_str==null){
//				this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_SET(table_name,data) data is not set");
//				return null;
//			} 
//			//user defined ht_load
//			this.__parentObj._PUB_Static.Push("@DB_SET")
//			var rt_value=this.__parentObj._CountStr$ComplyAndEval.call(this.__parentObj,this.$DB[table_name].set_ext,false,[
//				["{@_REC_DATA}",typeof data_str=="string" ? data_str : JSON.stringify(data_str)],
//				["{@_EXT_ACT}",ext_act ? encodeURIComponent(JSON.stringify(ext_act)) : "" ],
//				["{@_DEBUG}","__@DB_SET(AJAX)"],
//				["{@_TABLE_NAME}",table_name],
//				["{@_TABLE_NAME_SQL}",this.$DB[table_name].table_sql],
//				["{@_THEN_ACT}",!then_act? "" : then_act]]);//count and act;
//			this.__parentObj._PUB_Static.Pop()
//		  },
		  __CONTEXT_MENU:function(src_id,menu_div,add_para){
				//取得bindings
				var src_node,menu_node;
					//取得被点击对象
					if (src_id.indexOf('#')==0)
						src_node=$("#"+src_id);
					else
						src_node=(this.__parentObj.$elem).find("[id='"+src_id+"']");
					//取得弹出菜单
					if (menu_div.indexOf("#")==0)
						menu_node=$("#"+menu_div);
					else
						menu_node=(this.__parentObj.$elem).find("[id='"+menu_div+"']");
					
					if ((src_node.length<=0) || (menu_node.length<=0)){
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"CONTEXT_MENU(),menu_div not set attr id and ht_sel");
					return null;
				}
					//测试是否存在item;
					var items=[];
					var menu_items=$(menu_node).find('li')
					for (var i=0; i<menu_items.length; i++){
						var id=$(menu_items[i]).attr("id");
						if (!id){
							this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"CONTEXT_MENU(),'"+menu_div+"'->li->attr->id not exited");
							return null;
						}
						if (!add_para[id]){
							this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"CONTEXT_MENU(),'"+menu_div+"'-> li->id='"+id+"' not found in ht_act->add_para!");
							return null;
						}
					}
					//
					$(src_node).contextMenu(menu_div, { //菜单样式   
						bindings: add_para
					});
			},
			
			__CONTEXT_MENU_BIND:function(src_id,menu_div,param){
				//取得bindings
				var src_node,menu_node;
				//取得被点击对象
				if (src_id.indexOf('#')==0)
					src_node=$("#"+src_id);
				else
					src_node=(this.__parentObj.$elem).find("[id='"+src_id+"']");
				//取得弹出菜单
				if (menu_div.indexOf("#")==0)
					menu_node=$("#"+menu_div);
				else
					menu_node=(this.__parentObj.$elem).find("[id='"+menu_div+"']");
				
				if ((src_node.length<=0) || (menu_node.length<=0)){
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"CONTEXT_MENU(),menu_div not set attr id and ht_sel");
					return null;
				}
			
				//添加事件
				var items=[];
				var add_paras={}
				var menu_items=$(menu_node).find('li')
				for (var i=0; i<menu_items.length; i++){
					var id=$(menu_items[i]).attr("id");
					if (!id){
						this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"CONTEXT_MENU(),'"+menu_div+"'->li->attr->id not exited");
						return null;
					}
					//var test="function(t){$ht_eval('"+src_id+"',\""+$(menu_items[i]).attr("act")+"\")}";
					var test="function(t){"+this.__parentObj.this_obj_base_str+"._CountStr$ComplyAndEval.call("+this.__parentObj.this_obj_base_str+",\""+$(menu_items[i]).attr("act")+"\",false) }";
					add_paras[id]=this.__parentObj._CountStr$ComplyAndEval(test,true,[["{@_PARAM_0}",param],["{@_THIS}","$('#"+src_id+"')"],["{@_THIS_ID}",src_id]],undefined,true);
				}

				$(src_node).contextMenu(menu_div, { //菜单样式   
					bindings: add_paras
				});

				//添加移动长按
                longClick=0;
                $(src_node).on({
                    touchstart: function(e){
                        longClick=0;//设置初始为0
                        timeOutEvent = setTimeout(function(){
                            //此处为长按事件-----在此显示遮罩层及删除按钮
                            longClick=1;
                            //
                            console.log("这是长按事件id:"+src_node.attr("id")+"--"+e.originalEvent.pageX+"--"+e.originalEvent.pageY);
                            $(src_node).trigger("contextmenu",e.pageX ? null : e.originalEvent);
                            //
                            document.oncontextmenu = function (e) {//关闭操作系统contextmenu
                                e.preventDefault();
                            }
                        },800);
                    },
                    touchmove: function(e){
                        clearTimeout(timeOutEvent);
                        timeOutEvent = 0;
                        e.preventDefault();
                    },
                    touchend: function(e){
                        clearTimeout(timeOutEvent);
                        if(timeOutEvent!=0){//点击
                            //此处为点击事件----在此处添加跳转详情页
                            if (longClick==1){//长点点击
                                return false;//中断其他操作。
                            }else
                                console.log("这是短点击"+src_node.attr("id"));
                        }
                        return true;
                    }
                });
			},

		   __BOOTSTRAP_MODAL_IFRAM : function(model_div,iframe_div,frameSrc,header){
				$(iframe_div).attr("src", '');
				$(iframe_div).attr("src", frameSrc);
				$(model_div).modal({ show: true, backdrop: 'static' });
				var _scrollHeight = $(document).scrollTop();
				var wHeight = $(window).height();
				var this_height="620";
				var this_top=(wHeight-this_height)/2+_scrollHeight+"px";
				var this_top=(wHeight-this_height)/2+"px";
				var mycss={"width":"800px","height":"620px","top":"50px"};
				var myifmcss={};//iframe样式
				$(model_div+' .modal-dialog').css(mycss).find('.modal-content').css({height: '100%',width: '100%'}).find('h4').html(header).end().find('.modal-body').css({height: '85%'}).find(iframe_div).css(myifmcss);
				/*function showtip(frameSrc,otitle,cssobj,cssifm){
					$("#NoPermissioniframe").attr("src", frameSrc);
					$('#NoPermissionModal').modal({ show: true, backdrop: 'static' });
					var _scrollHeight = $(document).scrollTop();
					var wHeight = $(window).height();
					var this_height;
					if(cssobj&&cssobj["height"])
						this_height=cssobj["height"];
					else
						this_height="620";
					var this_top=(wHeight-this_height)/2+_scrollHeight+"px";
					var this_top=(wHeight-this_height)/2+"px";
					var mycss=cssobj||{"width":"800px","height":"620px","top":this_top};
					var myifmcss=cssifm||{};//iframe样式
					$('#NoPermissionModal .modal-dialog').css(mycss).find('.modal-content').css({height: '100%',width: '100%'}).find('h4').html(otitle||"").end().find('.modal-body').css({height: '85%'}).find("#NoPermissioniframe").css(myifmcss);;
				}*/ 
			},

		  
		   __BT_MODAL_OPEN : function(model_div,header,cssobj){
				var this_div;
				if (typeof model_div =="string")
					this_div=$('#'+model_div)
				else
					this_div=$(model_div)
				if (this_div.length==0){
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@BT_MODAL_OPEN() div('"+model_div+"') or div.modal-dialog is not exited!")
				}

				this_div.modal({ show: true, backdrop: 'static' });
				var _scrollHeight = $(document).scrollTop();
				var wHeight = $(window).height();
				var this_height=this_div.height();
				if(cssobj&&cssobj["height"])
					this_height=cssobj["height"];
				var this_top=(wHeight-this_height)/2+_scrollHeight+"px";
				var mycss=cssobj||{"height":this_height,"top":this_top};
				//$(model_div+' .modal-dialog').css(mycss).find('.modal-content').css({height: '100%',width: '100%'}).find('h4').html(header).end().find('.modal-body').css({height: '80%'}); //no bottom
				var dlg=this_div.find(".modal-dialog");
				//$(model_div+' .modal-dialog').css(mycss).find('.modal-content').css({height: '100%',width: '100%'}).find('h4').html(header).end()//has bottom
				if (dlg){
					if (header)
						$(dlg).css(mycss).find('.modal-content').css({height: '100%',width: '100%'}).find('h4').html(header).end()//has bottom
					else
						$(dlg).css(mycss).find('.modal-content').css({height: '100%',width: '100%'}).end()//has bottom
				}
				else{
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@BT_MODAL_OPEN(div,,,) div or div.modal-dialog is not exited!");
					return null;
				}
			},	

			__BT_MODAL_DIALOG : function(model_div,header,add_param,cssobj){
				if (!model_div){
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@__BT_MODAL_DIALOG(div,add_param) div is not exited!");
					return null;
				}
				if (typeof model_div =="string")
					this_div=$('#'+model_div);
				else
					this_div=$(model_div);
				if (!this_div){
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@__BT_MODAL_DIALOG(div,add_param) div("+model_div+") is not exited!");
					return null;
				}
				
				if (add_param){
					var html=$(this_div).html();
					if (this.__parentObj._PUB_IsArray(add_param))
						for(var i=0; i<add_param.length; i++)
	                		html=this.__parentObj._PUB_ReplaceStr(html,"{@_PARAM_"+i+"}",add_param[i]);
					else
						html=this.__parentObj._PUB_ReplaceStr(html,"{@_PARAM_0}",add_param);
					$(this_div).html(html);
				}

				//this.__SHOW(null,this_div);
				this.__BT_MODAL_OPEN(this_div,header,cssobj);
			},	


		  __DATATABLES_LOAD : function(table_name,conditions,param_obj,then_act){
				//user defined ht_load
				if (!this.$DB[table_name]||!this.$DB[table_name].get){
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_GET(table_name,[page_num,page_size]) table_name is not defined!");
					return null;
				}
				var params;
				if (typeof param_obj == "string")
					params=param_obj.split(",")
				else if (typeof param_obj == "number")
					params=[param_obj]
				else
					params=param_obj;
				if (params[0]==null){
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@DB_GET(table_name,[page_num,page_size]) 'page_num' or 'page_size' should be set!");
					return null;
				}
				var div_name=param_obj[0];
				//getData Options
				var items=$(div_name).find("[data-options]");
				var columns=[];
				this.__parentObj._PUB_Static.Push("DATATABLE_SHOW()");
				if (items.length==0){
					this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"no data-options defined!");
					return null;
				}
	    				
		        for(var i=0; i<items.length; i++){
		        		var eval_str="{"+$(items[i]).attr("data-options")+"}";
		        		if (eval_str.indexOf("{@_THIS_NODE_VALUE}")>=0){
		        			var html_str=$(items[i]).html();//get node's inner html
		        			var back_html=this.__NODE_BACK_HTML(div_name,'[data-options]',i,"for_html",true);
		        			var chg_str="$ht_func('"+this.__parentObj.objName+"','NODE_BACK_HTML','"+div_name+"','[data-options]',"+i+",'for_html')";
		        			eval_str=this.__parentObj._PUB_ReplaceStr(eval_str,"{@_THIS_NODE_VALUE}",chg_str);
		        		}
		        		var option_obj=this.__parentObj._CountStr$ComplyAndEval(eval_str,true);
		        		if (!option_obj){
		        			this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"Load data_options error!");
		        			return null;
		        		}	
		        		columns.push(option_obj);   		
		        }
		        this.__parentObj._PUB_Static.Pop();
				//drawTable
				var this_obj=this;
				var conditions_str=(!conditions ? "1%3d1" : conditions);
				var then_eval=!then_act? "" : then_act;
				var this_obj_parent=this.__parentObj;
				var oTable1 = $(param_obj[0]).dataTable({
				       "aaSorting": [[1, "desc"]],//默认第几个排序
				       "bStateSave": true,//状态保存
				       "serverSide": true,//!!!必须设置
					   "ajax": {
					        "url": "../WebService?act=GetTableJson3&table=product_info&conditions="+conditions_str+"&col="+this.$DB[table_name].fields_list,
					        "data":{},
					        "error": function () {
					            alertError("Get Repo Branch List Error!");
					        },
					        	"dataSrc": function (json) {
					        		json.draw = null;//json.row.draw;
				                json.recordsTotal = json.total;
				                json.recordsFiltered = json.total;
				                return json.data;
				            },
					    },
				        "drawCallback": function( settings ) {
				        		then_eval1=then_eval.substr(then_eval.indexOf("{")+1);
				        		then_eval2=then_eval1.substr(0,then_eval1.indexOf("}")-1);
				        		this_obj_parent._CountStr$ComplyAndEval.call(this_obj_parent,then_eval2);
				        },
					    "aoColumnDefs": [{
				            "render": function (data, type) {
				                return "<div align='center'><input type='checkbox' onclick = childclick() name='ckb-jobid' value=''" + data + "></div>" ;
				            },
				            "aTargets": 0 //第一列 
				        		},{
				            "bSortable": false,
				            "aTargets": [0,3,6]
				        		}],
				        	"columns":columns
				    });
			  },
			     
		   __DATATABLES_RELOAD:function(table_div){
			   //only for DataTables1.10.2以上
			   if (!table_div || !$(table_div)){
				   alert("@DATATABLES_RELOAD(div) div("+table_div+") not found!")
			   }
			   var oTable = $(table_div).DataTable(); //table1为表格的id
			   var this_obj=this;
			   oTable.ajax.reload(null,false); //
		   },
		  
		  __NODE_BACK_HTML:function(div_name,find_str,i,back_name,is_clear){
			  var items=$(div_name).find(find_str);
			  var for_html;
			  if ($(items[i]).data(back_name)==undefined){//first init
					for_html=$(items[i]).html();//get node's inner html
					$(items[i]).data(back_name,for_html);
					if (is_clear);
						$(items[i]).html("");
			  }else{//other step_
					for_html=$(items[i]).data(back_name);
			  }
			  return for_html
		  },
		  
		  __ZTREE_SHOW:function(div_name,z_nodes,exp_node,cb_func){
	  		if (!$.fn.zTree)
				alert("Error: zTreeShow()=> $.fn.zTree not defined!")
			//show tree，and cb_func
		    var this_obj=this;
			var setting = {
		            view: {
		                dblClickExpand: false,
		                showLine: false,
		                selectedMulti: false
		            },
		            data: {
		                simpleData: {
		                    enable: true,
		                    idKey: "id",
		                    pIdKey: "pId",
		                    rootPId: ""
		                }
		            },
		            callback:{
	    				beforeClick: function (tree_div, treeNode) {
	                        var zTree = $.fn.zTree.getZTreeObj(tree_div);
	                        var path=this_obj.__ZTREE_PATH__(treeNode);
	                        cb_func.call(this_obj.__parentObj,treeNode.id, path, treeNode.isParent)
	                        return true;
	                 }
	    			}
		        };
			
			//draw tree
			var t = $("#"+div_name);
		    	t = $.fn.zTree.init(t, setting, z_nodes); 	
		    	var zTree = $.fn.zTree.getZTreeObj(div_name);
		    	
		    	//expand point nodes
		    	if (!exp_node)
		    		exp_node='1'
		    var treeNode_root=zTree.getNodeByParam("id",exp_node);
		    	zTree.expandNode(treeNode_root);
		  },
		  
		  __ZTREE_PATH:function(tree_div,id,split){  
		      if (!tree_div && !id){
		    	  	//this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@ZTREE_PATH(dev,id) div or id is null!");
		    	  	return "";
		      } 	
		      var zTree = $.fn.zTree.getZTreeObj(tree_div);
		      if (!zTree){
		    	  	//this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@ZTREE_PATH(dev,id) div not found or not ztree object!");
		    	  	return "";
		      } 	
	          var node;
		      if (typeof id=="string"){
		    	  	node=zTree.getNodeByParam("id",id);
		      }else
		    	  	node=id;
		      return this.__ZTREE_PATH__(node,split)
		  },
		  
		  __ZTREE_PATH__:function(node,split,allNode){  
	      	if (!split)
	      		split="/";
		    	if(node==null)
		    		return "";
	      	if (!allNode)
	      		allNode=node['name'] //start selected
	    		curNode = node.getParentNode();
	        if (curNode==null)
	          	return allNode; //root end
	        allNode= curNode['name']+split+allNode;  
	        return this.__ZTREE_PATH__(curNode,split,allNode);   
		   },
		   
		   __PAGEINATION_LOAD:function(div,total_rec, curr_page, pagesize, callback) {
		        //列表翻页条bootstrap
		        var page_sum=Math.ceil(total_rec / pagesize) //trCounter/10; //？？？如果不能够整除，则+1
		        //draw total rec
				this_obj=this;
				if (total_rec==0 && $("#"+div)){
					$("#"+div).hide();
					return;
				}

		        $("#"+div) && $("#"+div).bootstrapPaginator({
		                bootstrapMajorVersion: 3,//设置版本号
		                currentPage: curr_page,// 显示第几页
		                totalPages: page_sum,// 总页数
		                numberOfPages: 10,// 显示页数
		                alignment:"center",
		                itemTexts: function (type, page1, current) {
			                switch (type) {
			                case "first":
			                return "<<";
			                case "prev":
			                return "<";
			                case "next":
			                return ">";
			                case "last":
			                return ">>";
			                case "page":
			                return page1;
			                }
		                },
		                //当单击操作按钮的时候, 执行该函数, 调用ajax渲染页面
		                onPageClicked: function (event,originalEvent,type,page_to) {
			                // 把当前点击的页码赋值给currentPage, 调用ajax,渲染页面
			                currentPage = page_to
			                callback && callback.call(this_obj.__parentObj,page_to)
			                //cb_func.call(this_obj.__parentObj,treeNode.id, path, treeNode.isParent)
		                }
		           })
		    },
		    
		    __UEDITOR_LOAD: function(div,bind_obj) {
		    		var ue_obj={};
		    		if ($("#"+div).length==0){
		    			this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@UEDITOR_LOAD() load element id("+div+") not exited!");
	        			return null;
		    		}
		    		//maximumWords: 9999, //允许的最大字符数
		    		ue_obj.ue= UE.getEditor(div,{maximumWords: 99999});
		    		ue_obj.bind=bind_obj;
		    		var src_obj=this;	
		    		var content=this.__DATA_GET(bind_obj)
		    		if (content==undefined){
		    			this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@UEDITOR_LOAD() load obj("+bind_obj+") undefined!");
	        			return null;
		    		}
		    		ue_obj.ue.ready(function() {
		    		    //设置编辑器的内容
		    			ue_obj.ue.setContent(src_obj.__HTML_DECODE(content));
		    		});
		    		return ue_obj;
		    },
		    
		    __UEDITOR_UPDATE: function(ue_obj) {
		    		if (!ue_obj || !(ue_obj.ue)){
		    			this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@UEDITOR_UPDATE() param ("+ue_obj+") undefined or not ue!");
	        			return false;
		    		}
		    		var content=ue_obj.ue.getContent();
		    		this.__DATA_SET(ue_obj.bind,this.__HTML_ENCODE(content));
		    		return true;
		    },
		    
		    __HTML_ENCODE: function (html) {
		        var tmp=$("<div>").text(html).html();
		        var tmp=tmp.replace(/\"/g, '&quot;');
		        var tmp=tmp.replace(/\'/g, '&squot;');
				var tmp=tmp.replace(/\$/g, '&dolla;');
				var tmp=tmp.replace(/@/g, '&mouse;');
				var tmp=tmp.replace(/\\/g, '&bslash;');
				var tmp=tmp.replace(/[\r\n]/g, '&rtnline;');
				return tmp;
		        //return escape(tmp);
		    },
		    
		    __HTML_DECODE: function (encodedHtml) {
		        var tmp= $("<div>").html(encodedHtml).text();
		        var tmp=tmp.replace(/&quot;/g, '"');
		        var tmp=tmp.replace(/&squot;/g, "'");
		        var tmp=tmp.replace(/&dolla;/g, '$');
		        var tmp=tmp.replace(/&mouse;/g, '@');
		        var tmp=tmp.replace(/&bslash;/g,'\\');
		        var tmp=tmp.replace(/&rtnline;/g,'\r\n');
		        return tmp
		        //return unescape(tmp)
		    },
		   
		  //@AJAX() function
		  __AJAX:function(params){
			 this.__parentObj._PUB_SendAjax(this.__parentObj,params,params.success,params.error,params.debug); 
		  },

		  __HTTP_PARAM:function(name){
		  		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
			    var r = window.location.search.substr(1).match(reg); 
			    if (r != null) return unescape(r[2]); 
			    return null;  
		  },
		  

		  __UPLOAD_FILE:function(url,upload_form,params,then_act) {
		      //
		      var refresh = params.indexOf("refresh")>=0 ? true : false;
		      
		      var debug_str = "@UPLOAD_FILE()";
		      var src_obj = this.__parentObj;
		      if (debug_str)
		          src_obj._PUB_Static.Push(debug_str);
		      //backup form form reinput
		      if (refresh && ($(upload_form).data("new_html") == undefined)) {//first init
		          var for_html = $(upload_form).html();//get node's inner html
		          $(upload_form).data("new_html", $(upload_form).html());
		      } 
		      //for_html = $(items[i]).data("for_html")
		      //
			  //var action_url = location.protocol + "//" + location.hostname + ":" + location.port + url //"/AVAT_DB/UPLOAD_FILE?name=上传文件名"
			  var action_url=this.__URL(url);
			  var formData = new FormData($(upload_form)[0]);
			  var local_params=params;
			  var this_obj=this;
		      $.ajax({
		          type: 'post',
		          url: action_url,
		          data: formData,
		          cache: false,
		          processData: false,
		          contentType: false,
		          beforeSend: function () {
		              var h = document.body.clientHeight;
		              var scrollTop = $(document.body).scrollTop()
		              $("<div class=\"datagrid-mask\"></div>").css({
		                  display: "block",
		                  width: "100%",
		                  height: h
		              }).appendTo("body");
		              $("<div class=\"datagrid-mask-msg\"></div>").html("uploading file，please wait...").appendTo("body").css({
		                  display: "block",
		                  left: ($(document.body).outerWidth(true) - 190) / 2,
		                  top: (($(window).height() - 45) / 2) + scrollTop,
		                  top: 400
		              });
		          },
		          complete: function (data) {
		              $('.datagrid-mask-msg').remove();
		              $('.datagrid-mask').remove();
		              //清空form 数据重新初始化
		              if (refresh) {
		                  $(upload_form).html($(upload_form).data("new_html"))
		              }
		              src_obj._PUB_Static.Pop();
				  },
				  success:function (data_in) {
					var data = data_in.indexOf("[") == 0 ? eval(data_in) : data_in;
					if (data[0] && data[0] == "error") {
						if (src_obj.errorLevel >= 1 || local_params.indexOf("error_alert"))
							src_obj._PUB_Error(src_obj._PUB_Static.Str() + data[1]);
						else
							console.log("upload_file error: " + data[1])
					}
					if (then_act) {
						if (typeof then_act == "string")
							src_obj._CountStr$ComplyAndEval(then_act, false, [["{@_RESULT}", data[1]],["{@_STATE}", data[0]]]);
						else
							then_act.call(this_obj, data);
					}
				},
				error:function (e) {
		          if (typeof e == "object")
		              err_str = " ajax error: (" + e.statusText + "  " + (e.responseText ? e.responseText : "") + ")-> " + param.url;
		          else
		              err_str = " ajax error: (" + e + ")->" + param.url;
		          src_obj._PUB_Error(this._PUB_Static.Str() + err_str);
		      	}
		      });
		  },
		  
		  __LOAD_JS:function loadJS( url, callback ){
				    var script = document.createElement('script'),
				        fn = callback || function(){};
				    script.type = 'text/javascript';
				    //IE
				    if(script.readyState){
				        script.onreadystatechange = function(){
				            if( script.readyState == 'loaded' || script.readyState == 'complete' ){
				                script.onreadystatechange = null;
				                fn();
				            }
				        };
				    }else{
				        //其他浏览器
				        script.onload = function(){
				            fn();
				        };
				    }
				    script.src = url;
				    document.getElementsByTagName('head')[0].appendChild(script);
		  },

		  //@AJAX() function
		  __HTTP_GET:function(url,dest_obj,then_act){
			var param={};
			if (url.indexOf('@_@RETURN_HTML:')==0){
				param.url=url.substr(15);
				param.data_type="html"
			}else
				param.url=url;
			param.method="get";
			
			//var dest_obj=dest_obj_name;
			param.success=function(data){//call back,already in this.__parentObj
				if (typeof dest_obj=="string")
					this.options.__DATA_SET(dest_obj,data);
				else
					dest_obj=data;
				if (typeof then_act=="string")
					  this._CountStr$ComplyAndEval(then_act,false);
				else
					then_act.call(this.options,data);
			};
			param.error=function(e){
				//var err_str=" ajax error: ("+e.statusText+") "+e.responseText;
				var err_str;
				if (typeof e=="object")
					err_str = "error: (" + (e.statusText == "OK" ? "" : e.statusText) + " " + (e.status == 404 ? "404 resource read error!" : "") + " " + (e.responseText ? e.responseText : "") + ")";	
				else
					  err_str="error: ("+e+")";
				this._PUB_Error(this._PUB_Static.Str()+err_str);

				if(e=="have not logged in or session time out!" && $HT_OBJ_PARAMS.login_path )
					window.location.href=$HT_OBJ_PARAMS.login_path;
			};
			param.debug="@HTTP_GET()";
			this.__parentObj._PUB_SendAjax(this.__parentObj,param,param.success,param.error,param.debug);
		},

		// __APPEND_OBJ:function(dest,src){
		// 	if (typeof dest=="string")
		// 		dest+=src;
		// 	else if (this.__IS_ARRAY(dest))
		// 		dest=dest.concat(src);
		// 	else if (typeof dest=="object")
		// 		$.extend(dest,src);
		// 	else
		// 		alert("@APPEND_OBJ src type error!");
		// 	return 
		// },
		__STR:function(obj){
			return JSON.stringify(obj);
		},
		__HTTP_POST:function(url,src_obj,dest_obj,then_act){
			var param={};
			param.url=url;
			param.method="post";
			param.sendData= typeof src_obj=="string" ? src_obj : JSON.stringify(src_obj)
			if (param.sendData==null){
				this.__parentObj._PUB_Error(this.__parentObj._PUB_Static.Str()+"@POST(url,src,dest)  src is not json or string !");
				return;
			}	 
			//var dest_obj=dest_obj_name;
			param.success=function(data){//call back,already in this.__parentObj
				if (typeof dest_obj=="string")
					this.options.__DATA_SET(dest_obj,data);
				else
					dest_obj=data;
				if (typeof then_act=="string")
					this._CountStr$ComplyAndEval(then_act,false);
				else
					then_act.call(this,data);
			};
			param.error=function(e){
			var err_str;
			if (typeof e=="object")
				err_str = "error: (" + (e.statusText == "OK" ? "" : e.statusText) + " " + (e.status == 404 ? "404 resource read error!" : "") + " " + (e.responseText ? e.responseText : "") + ")";
			else
					err_str="error: ("+e+")";
			this._PUB_Error(this._PUB_Static.Str()+err_str);
			};
			param.debug="@POST()";
			this.__parentObj._PUB_SendAjax(this.__parentObj,param,param.success,param.error,param.debug);
		},

		 __TYPE : function (obj){//ly second
			if (typeof obj =="string")
				return "string";
			if (typeof obj=="object"){
				if (this.__parentObj._PUB_IsArray(obj))
					return "array"
				else
					return "object"
			}
		 },

		 __PATH : function (objs,path_attr_str,split_str){//ly second 增补差错判断
			var split=split_str ? split_str : '/';
			var path_attr=path_attr_str ? path_attr_str : 'path';
			var r="";
			for(var i=0; i<objs.length; i++){
				if (i<(objs.length-1))
					r+=$(objs[i]).attr(path_attr)+split;
				else
					r+=$(objs[i]).attr(path_attr);
			}
			return r;
		 },

		//  __JOIN : function (objs,path_attr,add_arr,split_str){//ly second 增补差错判断
		// 	var split=split_str ? split_str : '/';
		// 	var r="";
		// 	//子节点相加
		// 	for(var i=0; i<objs.length; i++){
		// 		if ($(objs[i]).attr(path_attr)){
		// 			if (path_attr.indexOf('ht_')==0)
		// 				r+=this.__parentObj._CountStr$ComplyAndEval($(objs[i]).attr(path_attr))+split;
		// 			else
		// 				r+=$(objs[i]).attr(path_attr)+split;
		// 		}
		// 	}
		// 	//补充
		// 	if(add_arr){
		// 		if (this.__parentObj._PUB_IsArray(add_arr)){
		// 		for(var i=0; i<add_arr.length; i++)
		// 			r+=add_arr+split;
		// 	}else
		// 		r+=add_arr+split;
		// 	}

		// 	if (!r)
		// 		return r;
		// 	else
		// 		return r.substr(0,r.length-split.length);
		//  },

		__JOINS : function (arr_obj,split_str){//ly second 增补差错判断
			var split=split_str ? split_str : '/';
			var r="";
			
			for(var j=0; j<arr_obj.length; j++){
				var add_arr=arr_obj[j];
				if(add_arr)
					if (this.__parentObj._PUB_IsArray(add_arr)){
						for(var i=0; i<add_arr.length; i++)
							r+=add_arr[i]+split;
					}else{
						r+=add_arr+split;
					}
			}

			if (!r)
				return r;
			else
				return r.substr(0,r.length-split.length);
		 },

		 __ARR_STR : function (add_arr,split){//ly second 增补差错判断
			var r;
			if (this.__parentObj._PUB_IsArray(add_arr)){
				for(var i=0; i<add_arr.length; i++)
					r+=add_arr+split;
				if (!r)
					return r
				else
					return r.substr(0,r.length-split.length)
			}else{
				return null;
			}
		 },


		 __ATTRS : function (objs,path_attr,order){//ly second 增补差错判断
			var r=[];
		
			//子节点相加
			if (order=="REVERSE"){
				for(var i=objs.length-1; i>=0; i--){
					if ($(objs[i]).attr(path_attr)){
						if (path_attr.indexOf('ht_')==0)
							r.push(this.__parentObj._CountStr$ComplyAndEval($(objs[i]).attr(path_attr)));
						else
							r.push=$(objs[i]).attr(path_attr)
					}
				}
			}else{
				for(var i=0; i<objs.length; i++){
					if ($(objs[i]).attr(path_attr)){
						if (path_attr.indexOf('ht_')==0)
							r.push(this.__parentObj._CountStr$ComplyAndEval($(objs[i]).attr(path_attr)));
						else
							r.push=$(objs[i]).attr(path_attr)
					}
				}
			}
			
			return r;
		 },

		 __TOGGLE : function (obj,attr,first,second){//ly second
			if (!attr){
				return $(obj).toggle();
			}else if (attr=="class"){
				if (first)
					$(obj).toggleClass(first); 
				if (second)
					$(obj).toggleClass(second);
				return $(obj).attr("class");
			}else{
				var value=$(obj).attr(attr);
				if(value==first)
					$(obj.attr(attr,second));
				else
					$(obj.attr(attr,first));
				return $(obj).attr(attr);
			}
		 },

		 __PARAM_URI : function (param,add_param){//ly second
			var src={};
			$.extend(src,param,add_param ? add_param : {});
			var split="&";
			var r=""
			for(a in src){
				r+=a+"="+src[a]+split;
			}
			if (r)
				return r.substr(0,r.length-split.length);
			else
				return r;
		 },

		 __HT_SEARCH:function(search_val,field_sel,field_cfg_arr){
			var cell_type=field_cfg_arr[field_sel].type;
			var cell_width=parseInt(field_cfg_arr[field_sel].width);
			var field_val0=parseInt(field_sel);
			var field_val1=field_val0.toString(16);
			if (cell_type =="0x02"){
				var serials=null;
			     if (search_val.indexOf(",")>=0)
			         serials=search_val.split(",")
			     else
			         serials=search_val.split(";")
			     var tmp_val="0x";
			     for(var i=0; i< serials.length; i++){
			         if (serials[i].substr(0,2)!="0x" && this._PUB_IsNumber(serials[i]))
			             tmp_val+=( "0000000000000000" + parseInt(serials[i],10).toString(16) ).substr(-cell_width*2 )
			         else
			             tmp_val+=serials[i].substr(2)
			     };
			     search_val=tmp_val;
			}
			
			var condition_new_str;
			if (cell_type=="0x02")
			    condition_new_str=[["0x"+field_val1,"===",search_val]];
			else
			    condition_new_str=[["0x"+field_val1,"=",search_val]];
			return condition_new_str;
		},

		 __URI_PARAM : function (uri){//ly second
			var split="&";
			var param=uri.split(split);
			var r={};
			for(a in param){
				var p=param[a].split("=");
				r[p[0]]=p[1];
			}
			return r;
		 },

		 __CATE_TO_LIST : function (src){//ly second
			var path="";
			var result=[];
			this. __CATE_TO_LIST__(src,path,result);
			return result;
		 },

		 __CATE_TO_LIST__ : function (src,path,result){//ly second
			for(var a in src){
				if (typeof(src[a])=="object" && src[a][1]){//目录
					this.__CATE_TO_LIST__(src[a][1],path+'/'+src[a][0],result);
				}else
					result.push([path,src[a]]);
			}
		 },

		 __SPLIT : function (src,split_str,pos){//ly second
			var arr
			if (src){
				arr=src.split(split_str)
			}
			if (!arr)
				return null
			if (!pos){
				return arr;
			}	
			else if (typeof pos=="string" && pos=="end"){
				return arr[arr.length-1];
			}else if (typeof pos=="number" && pos<(arr.length-1)){
				return arr[pos];
			}else
				return null;
		 },

		 __COMPARE:function(field,asc_des){
			return(function(a,b){
				var v1=a[field];
				var v2=b[field]
				if (asc_des=="ASC")
					return a[field]-b[field]
				else
					return b[field]-a[field]
			})
		 },

		 __SORT:function(src_arr,field,asc_des){
			new_arr=src_arr.sort(this.__COMPARE(field,asc_des));
			return new_arr;
		 },

		__ADD_MATE:function(name,content){//手动添加mate标签
			let meta = document.createElement('meta');
			meta.content=content;
			meta.name=name;
			document.getElementsByTagName('head')[0].appendChild(meta);
		},

		__ADD_SCRIPT:function(src){//手动添加script标签
				let script=document.createElement("script");
				script.type="text/JavaScript";
				script.src= src;
				document.getElementsByTagName('head')[0].appendChild(script);
		},

		__ADD_IMG:function(pid,src,attr){//动态添加元素img标签
				attr=attr || {};
			　　　let parent = document.getElementById(pid);
			　　　let img = document.createElement("img");//添加 div
			　　　for(let i in attr){//设置 div属性
					img.setAttribute(i,attr[i]);
				}
			　　　img.src = src;
			　　　parent.appendChild(img);
		},

		__ADD_CSS:function(filename){
				var creatHead = $('head');
				creatHead.append('<link rel="stylesheet" href="'+filename+'">')
		},

		__REMOVE_LINK:function removejscssfile(filename,filetype){
				var targetelement=(filetype=="js")? "script" :(filetype=="css")? "link" : "none"
				var targetattr=(filetype=="js")?"src" : (filetype=="css")? "href" :"none"
				var allsuspects=document.getElementsByTagName(targetelement)
				for (var i=allsuspects.length; i>=0;i--){
					if (allsuspects[i] &&allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
					allsuspects[i].parentNode.removeChild(allsuspects[i])
				}
		},

		 __TRIM : function(src,left,right){
			 var r=src.trim();
			 if (left && r.indexOf(left)==0){
				 r=r.substr(left.length);
			 } 
			 if (right && r.indexOf(right)==(r.length-1)){
				 r=r.substr(0,r.length-right.length);
			 }
			 return r;	
		 },

		 /*__TIME(timestamp,param){
			//var timestamp = '1425553097';
			var d = new Date(timestamp * 1000);    //根据时间戳生成的时间对象
			if (!param){
				var date = (d.getFullYear()) + "-" + 
					(d.getMonth() + 1) + "-" +
					(d.getDate()) + " " + 
					(d.getHours()) + ":" + 
					(d.getMinutes()) + ":" + 
					(d.getSeconds());
			}else{
				var date = param.indexOf("YYYY") ? ((d.getFullYear()) + "-") : "" + 
				param.indexOf("-MM") ? ((d.getMonth() + 1) + "-"):"" +
				param.indexOf("-DD") ? ((d.getDate()) + " "):"" + 
				param.indexOf("hh") ? ((d.getHours()) + ":"):"" + 
				param.indexOf("mm") ? ((d.getMinutes()) + ":"):"" + 
				param.indexOf("ss") ? ((d.getSeconds())):"";
			}
			
			return date;
		 },*/

		// __POPUP(div){
		// 	$(div).css({
		// 		"opacity": "1",
		// 		"visibility": "visible"
		// 	});
		// 	$(div).toggle();
		// },

		__TIME:function(timestamp,format_in) {
			var this_d = new Date(timestamp * 1000);    //根据时间戳生成的时间对象
			var format=!format_in ? "yyyy-MM-dd hh:mm:ss" : format_in
			var date = {
				"M+": this_d.getMonth() + 1,
				"d+": this_d.getDate(),
				"h+": this_d.getHours(),
				"m+": this_d.getMinutes(),
				"s+": this_d.getSeconds(),
				"q+": Math.floor((this_d.getMonth() + 3) / 3),
				"S+": this_d.getMilliseconds()
			};
			if (/(y+)/i.test(format)) {
				format = format.replace(RegExp.$1, (this_d.getFullYear() + '').substr(4 - RegExp.$1.length));
			}
			for (var k in date) {
				if (new RegExp("(" + k + ")").test(format)) {
						format = format.replace(RegExp.$1, RegExp.$1.length == 1
								? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
				}
			}
			return format;
		},

		 __URL : function(url){
			var r=this.__parentObj._PUB_HTTP_URL(url)
			return r;	
		 },

		 __HISTORY_PUSH:function(uri){
			 //push 历史
			 $ht_history_push(uri);
		 },

		 __DOWNLOAD : function(url_in,saveName){
			 var url=this.__parentObj._PUB_HTTP_URL(url_in);
			//var r=this.__parentObj._PUB_DownLoadToLocal(url,save_name);
			if (window.navigator.msSaveBlob) {
				try {
					//创建XMLHttpRequest对象
					var xhr = new XMLHttpRequest();
					//配置请求方式、请求地址以及是否同步
					xhr.open('POST', url, true);
					//设置请求结果类型为blob
					xhr.responseType = 'blob';
					//请求成功回调函数
					xhr.onload = function(e) {
						if (this.status == 200) {//请求成功
							//获取blob对象
							var blob = this.response;
							//获取blob对象地址，并把值赋给容器
							window.navigator.msSaveBlob(blob, saveName);
						}
					};
					xhr.send();
				}catch (e) {
					console.log(e);
				}
			}else {
				if (typeof url == 'object' && url instanceof Blob) {
					url = URL.createObjectURL(url); // 创建blob地址
				}
				var aLink = document.createElement('a');
				aLink.href = url;
				aLink.download = saveName || '';
				var event;
				if (window.MouseEvent) { 
					event = new MouseEvent('click');
				}
				else {
					event = document.createEvent('MouseEvents');
					event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
				}
				aLink.dispatchEvent(event);
			}
		 },

		 __CLIP_COPY : function(text,div) {
			var tmp_div=div ? div[0] : document.body;
			var textarea = document.createElement("textarea");
			var currentFocus = document.activeElement;
			tmp_div.appendChild(textarea);
			textarea.value = text;
			textarea.focus();
			if (textarea.setSelectionRange)
				textarea.setSelectionRange(0, textarea.value.length);
			else
				textarea.select();
			try {
				var flag = document.execCommand("copy");
			} catch(eo){
				var flag = false;
			}
			tmp_div.removeChild(textarea);
			currentFocus.focus();
			return flag;
		},

		 __IIF : function(condition,true_str,false_str){
			if (condition){
				return true_str;
			}else{
				return false_str;
			}
		 },
		 __HT_CALL: function(ObjName,ht_eval_item,add_param_in,then_act){
			return this.__HT_OBJ_CALL(ObjName,ht_eval_item,add_param_in,then_act);
		 },

		  __HT_OBJ_CALL:function(ObjName,ht_eval_item,add_param_in,then_act){ //ly ht_obj_cb
				if ($HT_OBJ[ObjName]==undefined){
					alert("ht_obj->"+ObjName+" not exited!");
					return null;
				}
				if (ht_eval_item.indexOf("@.") == 0){//ly add2
					if (!this[ht_eval_item.substr(2)]) 
						return;
					return this[ht_eval_item.substr(2)].call(this, add_param_in);
				}else{
					var add_param=this.__parentObj._PUB_ArrObjAdd([["{@_HT_OBJ_CB}",this.__parentObj.this_obj_str],["{@_HT_OBJ_CB_ACT}",then_act]],add_param_in,"{@_PARAM_","}")
					$HT_OBJ[ObjName].options.__EVAL_NEXT(ht_eval_item,add_param);
					return true;
				}
			}
	    }    
    }

  $.fn.ht_obj = function (options,add_obj) {
      	return this.each(function () {
		//this.each(function () {
          if ($(this).data("ht_obj-init") === true) {
              return false;
          }
		$(this).data("ht_obj-init", true);
		var obj = Object.create(Ht_obj);
		if (!obj.Init(add_obj,options, this))
			return false;
		$.data(this, "ht_obj", obj);
		//外挂
		$(this).bind("Load",function (val) {
			obj.Load();
		})
		$(this).bind("Show",function (val) {
			obj.Show();
		})
	  });
	  //return $HT_OBJ[$(this).attr("ht_obj")];
  };

  $.fn.ht_obj.options = {
	__parentObj:null,
	no_refresh:false,
	do_load:false,
	$http_host:window.location.host,
	$http_protocol:window.location.protocol,
	$DB:{},
	$DATA:{}, 
	$GB:{cfg:{}},
	thisArray:[],
	$Verify:[]
  };
}(jQuery, window, document));

//load all ht_obj
function $ht_obj_load_all(){
  //get all <div ht_obj> objects
  var items=$("[ht_obj]");//for nodes
  //Init all ht_obj
  for(var i=0; i<items.length; i++){
    $(items[i]).ht_obj({});
  }
  //to do all ht_obj.Load
  for( var a in $HT_OBJ_IDS){
    $HT_OBJ_IDS[a].Load();
  }
}

function $HT_OBJ_DB_CITA_ECOMM(table_name,ht_obj,field_list,id_name){
	this.table=table_name;
	this.ht_obj=ht_obj;
	this.id_name=id_name;
	this.fields_list=field_list;
	this.total=0;
	this.get="@AJAX({url:HT_OBJ_DB_ACT_URI+'?act=GetTableJson3&table={@_TABLE_NAME_SQL}&conditions={@_CONDITIONS}&order={@_ORDER}&col="+this.fields_list+"&start='+({@_PAGE_NUM}-1)*{@_PAGE_SIZE}+'&length='+{@_PAGE_SIZE},\
			success:function(data){ @DATA_SET('{@_TABLE_NAME}',data.data,'{@_ADD_PARAMS}'); {@.$DB.{@_TABLE_NAME}.total}=data.total; {@_THEN_ACT} }, debug:'{@_DEBUG}' \
			})";
	this.del="@AJAX({url:HT_OBJ_DB_ACT_URI+'?table={@_TABLE_NAME_SQL}&act=DelTableJson&id={@_REC_ID}&id_name="+this.id_name+"',\
			success:function(data){ {@_THEN_ACT} } , debug:'{@_DEBUG}' \
			})";
	this.del_ext="@AJAX({url:HT_OBJ_DB_ACT_URI+'?table={@_TABLE_NAME_SQL}&act=DelTableJsonExt&ext_act={@_EXT_ACT}&id={@_REC_ID}&id_name="+this.id_name+"',\
			success:function(data){ {@_THEN_ACT} } , debug:'{@_DEBUG}' \
			})";
	this.set="@AJAX({url:HT_OBJ_DB_ACT_URI+'?table={@_TABLE_NAME_SQL}&act=SetTableJson&id_name="+this.id_name+"&id={@_REC_ID}',method:'post',sendData:'{@_REC_DATA}',\
			success:function(data){ {@_THEN_ACT} }, debug:'{@_DEBUG}',method:'POST' \
			})";
	this.set_ext="@AJAX({url:HT_OBJ_DB_ACT_URI+'?table={@_TABLE_NAME_SQL}&act=SetTableJsonExt&ext_act={@_EXT_ACT}&id_name="+this.id_name+"',method:'post',sendData:'{@_REC_DATA}',\
			success:function(data){ {@_THEN_ACT} }, debug:'{@_DEBUG}',method:'POST' \
			})";
}

if (!$ht_obj){
	
	function $ht_func(ObjName,func_obj,param1,param2,param3,param4,param5){
		if (func_obj.indexOf("@")==0)
			func_name="__"+func_obj.substr(1);
		else
			func_name="__"+func_obj;
		if (!$HT_OBJ[ObjName].options[func_name]){
			alert("ht_func->"+func_obj+" not exited!");
			return null;
		}
		return $HT_OBJ[ObjName].options[func_name].call($HT_OBJ[ObjName].options,param1,param2,param3,param4,param5);
	}
	
	function $ht_eval(ObjName,eval_str){
		return $HT_OBJ[ObjName].options['__EVAL'].call($HT_OBJ[ObjName].options,eval_str);
	}

	//历史压键函数
	function $ht_history_push(eval_str){//存储ht运行代码
		if (HT_OBJ_history){
			var hash_str = eval_str;
			var encode_str=encodeURIComponent(hash_str);
			var new_href=location.href.split("#")[0].split("?")[0]+"#"+encode_str;
			//window.location.href=new_href;
			history.pushState({hash:encode_str},'',new_href)
		}else
			HT_OBJ_HISTORY.concat([{hash:encode_str},'',new_href]); //展示未使用，今后可改为不需要history回推，直接操作历史连接
		
	}
	//设置后退回调函数
	function $ht_history_set(func_cb){//history 后退或前进
		if (HT_OBJ_history){
			window.onpopstate = function(event) {
			console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
			// if (!event.state)
			// 	window.location.reload();
			// else
			if (event.state)
				$ht_hash_run(event.state.hash,func_cb);
			};
		}
		
		// window.onhashchange(function(){
		// 	$ht_hash_run();
		// })
		// window.addEventListener("hashchange",function(){
		// 	$ht_hash_run();
		// })
	}
	//后退回调，取得连接后，链接跳转函数：
	function $ht_hash_run(encode_str,func_cb){//运行hash中的ht运行代码，可用于history.back()或链接跳转。
		var hash_str=decodeURIComponent(encode_str)
		if (func_cb){
			func_cb(hash_str)
		}else
			eval(eval_str);
	}
	
	function $ht_obj(ObjName,ParamName){
		if ($HT_OBJ[ObjName]==undefined){
			alert("ht_obj->"+ObjName+" not exited!");
			return null;
		}
		if (ParamName.indexOf("$.")==0){
			return $HT_OBJ[ObjName].options['__DATA_GET'].call($HT_OBJ[ObjName].options,ParamName.substr(2));
		}else{
			if ($HT_OBJ[ObjName].options[ParamName]==undefined){
				alert("ht_obj->"+ObjName+"->"+ParamName+" not exited!");
				return null;
			}
			return $HT_OBJ[ObjName].options[ParamName];
		}	
	}
	
	function $ht_obj_set(ObjName,ParamName,value){
		if ($HT_OBJ[ObjName]==undefined){
			alert("ht_obj->"+ObjName+" not exited!");
			return null;
		}
		if (ParamName.indexOf("$.")==0){
			return $HT_OBJ[ObjName].options['__DATA_SET'].call($HT_OBJ[ObjName].options,ParamName.substr(2),value);
		}else{
			if ($HT_OBJ[ObjName].options[ParamName]==undefined){
				alert("ht_obj->"+ObjName+"->"+ParamName+" not exited!");
				return null;
			}
			if (typeof value=="object")
				$HT_OBJ[ObjName].options[ParamName]=$.extend(true,{},value)
			else
				$HT_OBJ[ObjName].options[ParamName]=value;
		}
		return true;
	}
}
function $ht_http_params(name){
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
	var r = window.location.search.substr(1).match(reg); 
	if (r != null) return unescape(r[2]); 
	return null;  
}

function $ht_replace_doit(fcontent){
    //替换处理
	var tmp1=$ht_replace(fcontent,'aa1','"');
	var tmp2=$ht_replace(tmp1,'bb2',"'");
	return tmp2;
}

function $ht_replace(fcontent,oldstr,newstr){
    //替换处理
      var var1 = oldstr;
      
      //替换
      var rr= new RegExp(var1,"gi");
      fcontent = fcontent.replace(rr,newstr);
      return fcontent;
}

function $ht_ajax_loading_set(div,show_str){
	var loading_str=show_str && show_str!='' ? show_str : "loading...";
	var loading_div;
	if(!div){
		var load_div="ht_loading_div";
		$(document).ready(function(){
			$('body').append("<div style='display:none;width:100%; margin:0 auto;position:fixed;left:0;top:0;bottom: 0;z-index: 111;opacity: 0.5;' id='"+load_div+"'><a class='mui-active' style='left: 50%;position: absolute;top:50%'><span class='mui-spinner'></span><p style='margin-left: -10px;'>"+loading_str+"</p></a></div>");
		})
		loading_div="#"+load_div;
	}else
		loading_div="#"+div;
    $(document).ajaxStart(function(){
        $(loading_div).show();
    })
    $(document).ajaxComplete(function(){
        $(loading_div).hide();
    })
}

var $ht_classcodes = [];
window.$ht_import = {
	/*加载一批文件，_files:文件路径数组,可包括js,css,less文件,succes:加载成功回调函数*/
	LoadFileList: function (_files, succes) {
		var FileArray = [];
		if (typeof _files === "object") {
			FileArray = _files;
		} else {
			/*如果文件列表是字符串，则用,切分成数组*/
			if (typeof _files === "string") {
				FileArray = _files.split(",");
			}
		}
		if (FileArray != null && FileArray.length > 0) {
			var LoadedCount = 0;
			for (var i = 0; i < FileArray.length; i++) {
				loadFile(FileArray[i], function () {
					LoadedCount++;
					if (LoadedCount == FileArray.length) {
						succes();
					}
				})
			}
		}
		/*加载JS文件,url:文件路径,success:加载成功回调函数*/
		function loadFile(url, success) {
			if (!FileIsExt($ht_classcodes, url)) {
				var ThisType = GetFileType(url);
				var fileObj = null;
				if (ThisType == ".js") {
					fileObj = document.createElement('script');
					fileObj.src = url;
				} else if (ThisType == ".css") {
					fileObj = document.createElement('link');
					fileObj.href = url;
					fileObj.type = "text/css";
					fileObj.rel = "stylesheet";
				} else if (ThisType == ".less") {
					fileObj = document.createElement('link');
					fileObj.href = url;
					fileObj.type = "text/css";
					fileObj.rel = "stylesheet/less";
				}
				success = success || function () { };
				fileObj.onload = fileObj.onreadystatechange = function () {
					if (!this.readyState || 'loaded' === this.readyState || 'complete' === this.readyState) {
						success();
						$ht_classcodes.push(url)
					}
				}
				document.getElementsByTagName('head')[0].appendChild(fileObj);
			} else {
				success();
			}
		}
		/*获取文件类型,后缀名，小写*/
		function GetFileType(url) {
			if (url != null && url.length > 0) {
				return url.substr(url.lastIndexOf(".")).toLowerCase();
			}
			return "";
		}
		/*文件是否已加载*/
		function FileIsExt(FileArray, _url) {
			if (FileArray != null && FileArray.length > 0) {
				var len = FileArray.length;
				for (var i = 0; i < len; i++) {
					if (FileArray[i] == _url) {
						return true;
					}
				}
			}
			return false;
		}
	}
}

//ht_obj_load_all();
