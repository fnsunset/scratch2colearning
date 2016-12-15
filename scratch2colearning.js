(function(ext) {
    alert("Connect! Ver 12.15.01");
    var socket = { on: function(){} };
    var socket_id = '';
    var member_id = 0;
    var group_id = 0;
    var number_id = 0;
    var list_mem = ['A','B','C','D'];
    var list_obj = ['モモンガ','こうもり','カエル','ネコ','雪だるま','おばけ','飛行機','星','カンフーヌンチャク','ほうがん投げ','かめはめ波','カンフーガール','カンフーボーイ','ラグビーせんしゅ','ハンドボールボーイ','ハンドボールガール','アルティメット','やきゅうボール','バスケットボール','ドッジボール','ボウリング（みどり）','ボウリング（むらさき）','ハンドボール','ミラクルボール','サッカーボール','テニスボール','バレーボール'];
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
    var timer2 = 0;
    var send_server = [];
    var send_log = [];
    var send_log_old = [];
    var execution = [];
    var my_name = '';
    var log_size = 3;
    var wait_time = 40;
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
            if (data.Group == group_id ){
                if($.inArray(data.mes, say)==-1){
                    say.unshift(data.mes);
                }
            }
        });
        socket.on('server/memupdate', function (data) {
            if(member_id == data.ID){
                group_id = data.Group;
                number_id = data.Number;
                my_name = data.Name;
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
        socket.on('server/collision_on', function (data) {
            console.log('当たり判定を受信');
            if (data.group == group_id ){
                console.log('自分のグループと判断');
                if(data.mem1 == number_id){
                    obj_prop[data.mem2][data.obj2][data.obj1] = 1;
                    console.log('自分の'+data.obj1+'が、'+data.mem2+'の'+data.obj2+'に接触');
                }
                if(data.mem2 == number_id){
                    obj_prop[data.mem1][data.obj1][data.obj2] = 1;
                    console.log('自分の'+data.obj2+'が、'+data.mem1+'の'+data.obj1+'に接触');
                }
            }
        });
        socket.on('server/collision_off', function (data) {
            if (data.group == group_id ){
                    if(data.mem1 == number_id){
                        obj_prop[data.mem2][data.obj2][data.obj1] = 0;
                        console.log('自分の'+data.obj1+'が、'+data.mem2+'の'+data.obj2+'から離れた');
                    }
                    if(data.mem2 == number_id){
                        obj_prop[data.mem1][data.obj1][data.obj2] = 0;
                        console.log('自分の'+data.obj2+'が、'+data.mem1+'の'+data.obj1+'から離れた');
                    }
            }
        });
        socket.on('server/collision_disp',function(data){
            if (data.group == group_id ){
                console.log(data.mem+'の'+data.obj+'が隠れたので当たり判定をクリア');
                if(data.mem == number_id){
                    for(var cnta = 0; cnta < list_mem.length; cnta++){
                        for(var cntb = 0; cntb < list_obj.length; cntb++){
                        obj_prop[cnta][cntb][data.obj] = 0;
                        }
                    }
                }
                for(var cnt = 0;cnt < list_obj.length;cnt++){
                    obj_prop[data.mem][data.obj][cnt] = 0;
                }
        }
        });
        socket.on('server/disconnect', function(data) { 
            if(data.id = member_id){
                alert('切断されました');
                socket.disconnect();
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
            socket.emit(val.emit, {obj: val.obj, num1: val.num1, num2: val.num2, id: val.id, str: val.str, emitsw: 1});
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
                        socket.emit(val.emit, {obj: val.obj, num1: val.num1, num2: val.num2, id: val.id, str: val.str, emitsw: -1});
                        break;
                    }
                }
            }
        });
        if(timer === log_size){
            console.log('実行する命令がありません');
            $.each(execution,function(i,val){
                socket.emit(val.emit, {obj: val.obj, num1: val.num1, num2: val.num2, id: val.id, str: val.str, emitsw: -1});
                console.log(val.emit + ' stop');
            });
            execution = [];
        }
        if(timer > 100){
            timer = 100;
        }else{
            timer++;
        }
        if(timer2 > 10){
            timer2 = 10;
        }else{
            timer2++;
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
        return(my_name+'('+member_id+')/グループ'+group_id+' あなたは'+list_mem[number_id]+'さん');
    };
    ext.Obj_move = function(str,num) {
        if(str!=''){
            timer = 0;
            var emit = {emit:'scratch/move', obj: $.inArray(str, list_obj), num1: num, num2: 0, id: socket_id, str: '', emitsw: 1};
            if(!checkJSONarray(emit,send_server)){
                send_server.push(emit);
            }
        }
    };
    ext.Obj_cw = function(str,num) {
        if(str!=''){
            timer = 0;
            var emit = {emit:'scratch/rotate', obj: $.inArray(str, list_obj), num1: num * -1, num2: 0, id: socket_id, str: '', emitsw: 1};
            if(!checkJSONarray(emit,send_server)){
                send_server.push(emit);
            }
        }
    };
    ext.Obj_rcw = function(str,num) {
        if(str!=''){
            timer = 0;
            var emit = {emit:'scratch/rotate', obj: $.inArray(str, list_obj), num1: num, num2: 0, id: socket_id, str: '', emitsw: 1};
            if(!checkJSONarray(emit,send_server)){
                send_server.push(emit);
            }
        }
    };
    ext.Obj_ang = function(str,num) {
        if(str!=''){
            timer = 0;
            var emit = {emit:'scratch/ang', obj: $.inArray(str, list_obj), num1: num, num2: 0, id: socket_id, str: '', emitsw: 1};
            if(!checkJSONarray(emit,send_server)){
                send_server.push(emit);
            }
        }
    };
    ext.Obj_direct = function(str1,str2,str3) {
        if(str1!='' && str2!='' && str3!=''){
            timer = 0;
            var num = Math.atan2(obj_prop[$.inArray(str2, list_mem)][$.inArray(str3, list_obj)][list_obj.length-1] - obj_prop[number_id][$.inArray(str1, list_obj)][list_obj.length-1], obj_prop[$.inArray(str2, list_mem)][$.inArray(str3, list_obj)][list_obj.length-2] - obj_prop[number_id][$.inArray(str1, list_obj)][list_obj.length-2]) * 180 / Math.PI;
            console.log('向けるやつきました');
            var emit = {emit:'scratch/ang', obj: $.inArray(str1, list_obj), num1: num, num2: 0, id: socket_id, str: '', emitsw: 1};
            if(!checkJSONarray(emit,send_server)){
                send_server.push(emit);
            }
        }
    };
    ext.Obj_movex = function(str,num) {
        if(str!=''){
            timer = 0;
            var emit = {emit:'scratch/movexy', obj: $.inArray(str, list_obj), num1: num, num2: 0, id: socket_id, str: '', emitsw: 1};
            if(!checkJSONarray(emit,send_server)){
                send_server.push(emit);
            }
        }
    };
    ext.Obj_movey = function(str,num) {
        if(str!=''){
            timer = 0;
            var emit = {emit:'scratch/movexy', obj: $.inArray(str, list_obj), num1: 0, num2: num, id: socket_id, str: '', emitsw: 1};
            if(!checkJSONarray(emit,send_server)){
                send_server.push(emit);
            }
        }
    };
    ext.Obj_center = function(str,num1,num2) {
        if(str!=''){
            timer = 0;
            var emit = {emit:'scratch/center', obj: $.inArray(str, list_obj), num1: 0, num2: 0, id: socket_id, str: '', emitsw: 1};
            if(!checkJSONarray(emit,send_server)){
                send_server.push(emit);
            }
        }
    };
    ext.Obj_warp = function(str1,str2,str3) {
        if(str1!='' && str2!='' && str3!=''){
            timer = 0;
            var emit = {emit:'scratch/warp', obj: $.inArray(str1, list_obj), num1: obj_prop[$.inArray(str2, list_mem)][$.inArray(str3, list_obj)][list_obj.length-2], num2: obj_prop[$.inArray(str2, list_mem)][$.inArray(str3, list_obj)][list_obj.length-1], id: socket_id, str: '', emitsw: 1};
            if(!checkJSONarray(emit,send_server)){
                send_server.push(emit);
            }
        }
    };
    ext.Obj_hide = function(str) {
        if(str!=''){
            timer = 0;
            var emit = {emit:'scratch/hide', obj: $.inArray(str, list_obj), num1: 0, num2: 0, id: socket_id, str: '', emitsw: 1};
            if(!checkJSONarray(emit,send_server)){
                send_server.push(emit);
            }
        }
    };
    ext.Obj_appear = function(str) {
        if(str!=''){
            timer = 0;
            var emit = {emit:'scratch/hide', obj: $.inArray(str, list_obj), num1: 1, num2: 0, id: socket_id, str: '', emitsw: 1};
            if(!checkJSONarray(emit,send_server)){
                send_server.push(emit);
            }
        }
    };
    ext.Obj_getx = function(str1,str2) {
        if(str1!='' && str2!=''){
            return(obj_prop[$.inArray(str1, list_mem)][$.inArray(str2, list_obj)][list_obj.length-2]);
        }
    };
    ext.Obj_gety = function(str1,str2) {
        if(str1!='' && str2!=''){
            return(obj_prop[$.inArray(str1, list_mem)][$.inArray(str2, list_obj)][list_obj.length-1]);
        }
    };
    ext.Obj_hit = function(str1,str2,str3) {
        if(str1!='' && str2!='' && str3!=''){
            if(obj_prop[$.inArray(str2, list_mem)][$.inArray(str3, list_obj)][$.inArray(str1, list_obj)] != 0){
                return(true);
            }else{
                return(false);
            }
        }
    };
    ext.Obj_res = function(str) {
        if(str!=''){
            var sayid = $.inArray(str, say);
            if(sayid + 1 && say_log){
                say.splice(sayid, 1);
                say_log = false;
                return(true);
            }else{
                say_log = true;
                return(false);
            }
        }
    };
    ext.Obj_send = function(str) {
        if(str!=''){
            timer = 0;
            if(timer2 >5){
                socket.emit('scratch/send', {Group:group_id, id: socket_id, mes: str});
                timer2 = 0;
            }
        }
    };
    ext.Obj_property = function() {
        return group_id * (number_id + 1);
    }
    // ブロックと関数のひも付け
    var descriptor = {
        blocks: [
            [' ', 'Connect %s', 'Connect','192.168.2.104'],
            ['r', 'Socket ID', 'Obj_getid'],
            ['r', 'property', 'Obj_property'],
            [' ', '%m.List_obj を %n 歩動かす', 'Obj_move', '',10],
            [' ', '%m.List_obj を時計回りに %n 度回す', 'Obj_cw', '', 15],
            [' ', '%m.List_obj を反時計回りに %n 度回す', 'Obj_rcw', '', 15],
            [' ', '%m.List_obj を %n 度に向ける', 'Obj_ang', '', 10],
            [' ', '%m.List_obj を %m.List_member さんの %m.List_obj に向ける', 'Obj_direct', '', '', ''],
            [' ', '%m.List_obj のx座標を %n ずつ変える', 'Obj_movex', '', 10],
            [' ', '%m.List_obj のｙ座標を %n ずつ変える', 'Obj_movey', '', 10],
            [' ', '%m.List_obj を真ん中に動かす', 'Obj_center', ''],
            [' ', '%m.List_obj を %m.List_member さんの %m.List_obj に動かす', 'Obj_warp', '','',''],
            [' ', '%m.List_obj を 表示する', 'Obj_appear', ''],
            [' ', '%m.List_obj を 隠す', 'Obj_hide', ''],
            ['r', '%m.List_member さんの %m.List_obj のx座標', 'Obj_getx', '', ''],
            ['r', '%m.List_member さんの %m.List_obj のy座標', 'Obj_gety', '', ''],
            ['b', '%m.List_obj が %m.List_member さんの %m.List_obj と触れた', 'Obj_hit', '', '', ''],
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