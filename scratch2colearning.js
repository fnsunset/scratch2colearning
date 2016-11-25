(function(ext) {
    alert("Connect! Ver 11.25.07");
    var socket = { on: function(){} };
    var socket_id = '';
    var member_id = 0;
    var group_id = 0;
    var number_id = 0;
    var list_mem = ['A','B','C','D'];
    var list_obj = ['モモンガ','ボール','ゆきだるま'];
    var obj_prop = [];//obj_propは[a]さんの[b]のobj
    var allobj = list_mem.length * list_obj.length;
    for(var cnta = 0; cnta < list_mem.length; cnta++){
        obj_prop[cnta] = [];
        for(var cntb = 0; cntb < list_obj.length; cntb++){
            obj_prop[cnta][cntb] = [];
            for(var cntc = 0; cntc < list_obj.length + 2; cntc++){
                obj_prop[cnta][cntb][cntc] = 0;
            }
        }
    }

    var say = [];    //メッセージの送受信を記録に残す用
    var say_log = false;    //寸前にtrueになってたら一旦falseにするためのスイッチ
    var timer = 0;
    var send_server = [];
    var send_log = [];
    var send_log_old = [];
    var execution = [];
    var log_size = 3;
    var wait_time = 35;
    for(var cnta = 0; cnta < log_size; cnta++){
                send_log[cnta] = [];
    }
    var connect_server = function(str){
        if(!socket.connected){
        socket = io.connect('http://'+str+':8080');
        }else{
            socket = io.connect();
        }
        socket.on('server/hello', function (data) {
            socket.emit('scratch/hello', { id: socket_id });
        });
        socket.on('server/send', function (data) {
            if($.inArray(data.mes, say)==-1){
                say.unshift(data.mes);
            }
        });
        socket.on('server/memupdate', function (data) {
            if(member_id == data.Number){
                group_id = data.Group;
                number_id = data.Number;
            }
        });
        socket.on('server/objupdate', function (data) {
            if (data.group == group_id ){
            obj_prop[data.no][data.obj][list_obj.length-2] = data.objx;
            obj_prop[data.no][data.obj][list_obj.length-1] = data.objy;
            }
        });
        socket.on('server/tellid', function (data) {
            member_id = data.idnumber;
        });
        socket.on('server/colision_on', function (data) {
            if (data.group == group_id ){
                if(data.mem1 == member_id){
                    obj_prop[data.mem2][data.obj2][data.obj1] = 1;
                }
                if(data.mem2 == member_id){
                    obj_prop[data.mem1][data.obj1][data.obj2] = 1; 
                }
            }
        });
        socket.on('server/colision_off', function (data) {
        if (data.group == group_id ){
                if(data.mem1 == member_id){
                    obj_prop[data.mem2][data.obj2][data.obj1] = 0;
                }
                if(data.mem2 == member_id){
                    obj_prop[data.mem1][data.obj1][data.obj2] = 0; 
                }
        }
        });
        //接続が確立したら自分のIDを取得する
        socket.on('connect', function() { 
            socket_id = socket.id;
        });
    }

    var checkJSONarray = function(object,objectarray){
        if(objectarray){
            for(var cnt = 0; cnt < objectarray.length; cnt++){
                if(checkJSON(object,objectarray[cnt])){
                    return true;
                }
            }
        }
        return false;
    }

    var checkJSON = function(object1,object2){
        var object1String = JSON.stringify(object1); 
        var object2String = JSON.stringify(object2);
        // json文字列で比較する
        if (object1String === object2String) {
            return true;
        } else {
            return false;
        }
    }

    var _timer = function(){                //指定ミリ秒に1回実行される
        $.each(send_server,function(i,val){ //今回新しく拾った命令たち
            if(!checkJSONarray(val,execution)){ //実行中命令リストから見つからなければ
                execution.push(val);            //実行中命令に含める
                console.log(val.emit + ' start');   //開始！
            //socket.emit(val.emit, {obj: val.obj, num1: val.num1, num2: val.num2, id: val.id, str: val.str, emitsw: 1});
            }
        });
        for(var cnta = 0; cnta < log_size-1; cnta++){
                send_log[cnta] = $.extend(true, [], send_log[cnta+1]);
        }
        send_log[log_size-1] = $.extend(true, [], send_server);
        send_log_old = [];
        for(var cnta = 1; cnta < log_size; cnta++){
                send_log_old = $.extend(true, [], send_log_old, send_log[cnta]);
        }
        send_server = [];
        $.each(send_log[0],function(i,val){     //（だいたい）5フレーム前の命令リスト
            if(!checkJSONarray(val,send_log_old)){  //4フレーム~0フレーム前までに実行されていなければ
                for(var cnt = 0; cnt < execution.length;cnt++){ //実行中命令一覧から消去して
                    if(checkJSON(val,execution[cnt])){
                        execution.splice(cnt,1);
                        console.log(val.emit + ' stop');    //止めます！
                        //socket.emit(val.emit, {obj: val.obj, num1: val.num1, num2: val.num2, id: val.id, str: val.str, emitsw: 0});
                        break;
                    }
                }
            }
        });
        if(timer === log_size){
            console.log('実行する命令がありません');
            $.each(execution,function(i,val){
                //socket.emit(val.emit, {obj: val.obj, num1: val.num1, num2: val.num2, id: val.id, str: val.str, emitsw: 0});
                console.log(val.emit + ' stop');
            });
            execution = [];
        }
        if(timer > 100){
            timer = 100;
        }else{
            timer++;
        }
    }

    // shutdown時に呼ばれる
    ext._shutdown = function() {
        socket.emit('scratch/bye', { id: socket_id });
    };

    // statusを返してやる。デバイスとつながってない時とかここで色々返せる。
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//
    //\\メッセージを受信したときに起こすアクションをここに記述//\\
    //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\

    //サーバ側から接続完了後のメッセージを受け取ったらIDを返す

    //ここまで

    // blockが呼び出された時に呼ばれる関数を登録する。
    // 下にあるdescriptorでブロックと関数のひも付けを行っている。
    ext.Connect = function (str) {
        connect_server(str);
    };
    ext.Obj_getid = function() {
        return(member_id+'/'+group_id+' あなたは'+list_mem[number_id]+'さん');
    };
    ext.Obj_move = function(str,num) {
        timer = 0;
        var emit = {emit:'scratch/move', obj: $.inArray(str, list_obj), num1: num, num2: 0, id: socket_id, str: '', emitsw: 1};
        if(!checkJSONarray(emit,send_server)){
            send_server.push(emit);
        }
        
        //socket.emit('scratch/move', { obj: $.inArray(str, list_obj), move: num, id: socket_id });
    };
    ext.Obj_cw = function(str,num) {
        timer = 0;
        var emit = {emit:'scratch/rotate', obj: $.inArray(str, list_obj), num1: num * -1, num2: 0, id: socket_id, str: '', emitsw: 1};
        if(!checkJSONarray(emit,send_server)){
            send_server.push(emit);
        }
        
        //socket.emit('scratch/rotate', { obj: $.inArray(str, list_obj), rotate: num * -1, id: socket_id });
    };
    ext.Obj_rcw = function(str,num) {
        timer = 0;
        var emit = {emit:'scratch/rotate', obj: $.inArray(str, list_obj), num1: num, num2: 0, id: socket_id, str: '', emitsw: 1};
        if(!checkJSONarray(emit,send_server)){
            send_server.push(emit);
        }
        
        //socket.emit('scratch/rotate', { obj: $.inArray(str, list_obj), rotate: num , id: socket_id });
    };
    ext.Obj_ang = function(str,num) {
        timer = 0;
        var emit = {emit:'scratch/ang', obj: $.inArray(str, list_obj), num1: num, num2: 0, id: socket_id, str: '', emitsw: 1};
        if(!checkJSONarray(emit,send_server)){
            send_server.push(emit);
        }
        
        //socket.emit('scratch/ang', { obj: $.inArray(str, list_obj), angle: num, id: socket_id });
    };
    ext.Obj_direct = function(str1,str2,str3) {
        timer = 0;
        var num = Math.atan2(obj_prop[$.inArray(str2, list_mem)][$.inArray(str3, list_obj)][list_obj.length-1] - obj_prop[number_id][$.inArray(str1, list_obj)][list_obj.length-1], obj_prop[$.inArray(str2, list_mem)][$.inArray(str3, list_obj)][list_obj.length-2] - obj_prop[number_id][$.inArray(str1, list_obj)][list_obj.length-1]) * 180 / Math.PI;
        var emit = {emit:'scratch/ang', obj: $.inArray(str1, list_obj), num1: num, num2: 0, id: socket_id, str: '', emitsw: 1};
        if(!checkJSONarray(emit,send_server)){
            send_server.push(emit);
        }
        
        //socket.emit('scratch/ang', { obj: $.inArray(str1, list_obj), angle: num, id: socket_id });
    };
    ext.Obj_movex = function(str,num) {
        timer = 0;
        var emit = {emit:'scratch/movexy', obj: $.inArray(str, list_obj), num1: num, num2: 0, id: socket_id, str: '', emitsw: 1};
        if(!checkJSONarray(emit,send_server)){
            send_server.push(emit);
        }
        
        //socket.emit('scratch/movex', { obj: $.inArray(str, list_obj), movex: num, id: socket_id });
    };
    ext.Obj_movey = function(str,num) {
        timer = 0;
        var emit = {emit:'scratch/movexy', obj: $.inArray(str, list_obj), num1: 0, num2: num, id: socket_id, str: '', emitsw: 1};
        if(!checkJSONarray(emit,send_server)){
            send_server.push(emit);
        }
        
        //socket.emit('scratch/movey', { obj: $.inArray(str, list_obj), movey: num, id: socket_id });
    };
    ext.Obj_center = function(str,num1,num2) {
        timer = 0;
        var emit = {emit:'scratch/center', obj: $.inArray(str, list_obj), num1: 0, num2: 0, id: socket_id, str: '', emitsw: 1};
        if(!checkJSONarray(emit,send_server)){
            send_server.push(emit);
        }
        
        //socket.emit('scratch/warp', { obj: $.inArray(str, list_obj), warpx: 0, warpy: 0, id: socket_id, center:1});
    };
    ext.Obj_warp = function(str1,str2,str3) {
        timer = 0;
        var emit = {emit:'scratch/warp', obj: $.inArray(str, list_obj), num1: obj_prop[$.inArray(str2, list_mem)][$.inArray(str3, list_obj)][list_obj.length-2], num2: obj_prop[$.inArray(str2, list_mem)][$.inArray(str3, list_obj)][list_obj.length-1], id: socket_id, str: '', emitsw: 1};
        if(!checkJSONarray(emit,send_server)){
            send_server.push(emit);
        }
        
        //socket.emit('scratch/warp', { obj: $.inArray(str1, list_obj), warpx: obj_prop[$.inArray(str2, list_mem)][$.inArray(str3, list_obj)][list_obj.length-2], warpy: obj_prop[$.inArray(str2, list_mem)][$.inArray(str3, list_obj)][list_obj.length-1], id: socket_id, center:1});
    };
    ext.Obj_hide = function(str) {
        timer = 0;
        var emit = {emit:'scratch/hide', obj: $.inArray(str, list_obj), num1: 0, num2: 0, id: socket_id, str: '', emitsw: 1};
        if(!checkJSONarray(emit,send_server)){
            send_server.push(emit);
        }
        
        //socket.emit('scratch/hide', { obj: $.inArray(str, list_obj), id: socket_id });
    };
    ext.Obj_appear = function(str) {
        timer = 0;
        var emit = {emit:'scratch/hide', obj: $.inArray(str, list_obj), num1: 1, num2: 0, id: socket_id, str: '', emitsw: 1};
        if(!checkJSONarray(emit,send_server)){
            send_server.push(emit);
        }
        
        //socket.emit('scratch/appear', { obj: $.inArray(str, list_obj), id: socket_id });
    };
    ext.Obj_getx = function(str1,str2) {
        return(obj_prop[$.inArray(str1, list_mem)][$.inArray(str2, list_obj)][list_obj.length-2]);
    };
    ext.Obj_gety = function(str1,str2) {
        return(obj_prop[$.inArray(str1, list_mem)][$.inArray(str2, list_obj)][list_obj.length-1]);
    };
    ext.Obj_hit = function(str1,str2,str3) {
        if(obj_prop[$.inArray(str1, list_mem)][$.inArray(str2, list_obj)][$.inArray(str3, list_obj)] != 0){
            return(true);
        }else{
            return(false);
        }
    };
    ext.Obj_res = function(str) {
        var sayid = $.inArray(str, say);
        if(sayid + 1 && say_log){
            say.splice(sayid, 1);
            say_log = false;
            return(true);
        }else{
            say_log = true;
            return(false);
        }
    };
    ext.Obj_send = function(str) {
        timer = 0;
        var emit = {emit:'scratch/send', obj: $.inArray(str, list_obj), num1: 0, num2: 0, id: socket_id, str: '', emitsw: 1};
        if(checkJSONarray(emit,send_server)){
            send_server.unshift(emit);
        }
        
        //socket.emit('scratch/send', { mes: str, id: socket_id });
    };
    ext.Obj_emit = function(){
        return(timer);
    };
    // ブロックと関数のひも付け
    var descriptor = {
        blocks: [
            [' ', 'Connect %s', 'Connect','192.168.2.104'],
            ['r', 'Socket ID', 'Obj_getid'],
            ['r', 'emit', 'Obj_emit'],
            [' ', '%m.List_obj を %n 歩動かす', 'Obj_move', list_obj[0],10],
            [' ', '%m.List_obj を時計回りに %n 度回す', 'Obj_cw', list_obj[0], 15],
            [' ', '%m.List_obj を反時計回りに %n 度回す', 'Obj_rcw', list_obj[0], 15],
            [' ', '%m.List_obj を %n 度に向ける', 'Obj_ang', list_obj[0], 10],
            [' ', '自分の %m.List_obj を %m.List_member さんの %m.List_obj に向ける', 'Obj_direct', list_obj[0], list_mem[0], list_obj[0]],
            [' ', '%m.List_obj のx座標を %n ずつ変える', 'Obj_movex', list_obj[0], 10],
            [' ', '%m.List_obj のｙ座標を %n ずつ変える', 'Obj_movey', list_obj[0], 10],
            [' ', '%m.List_obj を真ん中に動かす', 'Obj_center', list_obj[0]],
            [' ', '%m.List_obj を %m.List_member さんの %m.List_obj に動かす', 'Obj_warp', list_obj[0],list_mem[0],list_obj[0]],
            [' ', '%m.List_obj を 表示する', 'Obj_appear', list_obj[0]],
            [' ', '%m.List_obj を 隠す', 'Obj_hide', list_obj[0]],
            ['r', '%m.List_member さんの %m.List_obj のx座標', 'Obj_getx', list_mem[0], list_obj[0]],
            ['r', '%m.List_member さんの %m.List_obj のy座標', 'Obj_gety', list_mem[0], list_obj[0]],
            ['b', '%m.List_member さんの %m.List_obj と自分の %m.List_obj が触れた', 'Obj_hit', list_mem[0], list_obj[0], list_obj[0]],
            ['h', '%s を受け取ったとき','Obj_res','Hello'],
            [' ','%s を送る','Obj_send','Hello']
        ],
        menus:{
            List_member: list_mem,
            List_obj:list_obj
        }
    };

    setInterval(_timer,wait_time);
    // 最後にExtensionを登録する
    ScratchExtensions.register('Scratch 2 Co-learning', descriptor, ext);

})({});