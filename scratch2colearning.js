(function(ext) {
    alert("Connect! Ver 11.22.03");
    var socket = io.connect('http://192.168.2.104:8080');
    var socket_id = '';
    var member_id = '';
    var list_mem = ['A','B','C','D'];
    var list_obj = ['ねこ','モモンガ','カエル'];
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

    //接続が確立したら自分のIDを取得する
    socket.on('connect', function() { 
        socket_id = socket.id;
     });
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
    socket.on('server/hello', function (data) {
        socket.emit('scratch/hello', { id: socket_id });
	});
    socket.on('server/send', function (data) {
        if($.inArray(data.mes, say)==-1){
            say.unshift(data.mes);
        }
	});
    socket.on('server/objupdate', function (data) {
       obj_prop[data.no][data.obj][list_obj.length-2] = data.objx;
       obj_prop[data.no][data.obj][list_obj.length-1] = data.objy;
    });
    socket.on('server/objhit', function (data) {
       obj_prop[data.no][data.obj][data.myobj] = data.hit;
    });
    socket.on('server/tellid', function (data) {
       member_id = data.idnumber;
    });
    //ここまで

    // blockが呼び出された時に呼ばれる関数を登録する。
    // 下にあるdescriptorでブロックと関数のひも付けを行っている。
    ext.Obj_getid = function() {
        return(member_id);
    };
    ext.Obj_move = function(str,num) {
        socket.emit('scratch/move', { obj: $.inArray(str, list_obj), move: num, id: socket_id });
    };
    ext.Obj_cw = function(str,num) {
        socket.emit('scratch/rotate', { obj: $.inArray(str, list_obj), rotate: num * -1, id: socket_id });
    };
    ext.Obj_rcw = function(str,num) {
        socket.emit('scratch/rotate', { obj: $.inArray(str, list_obj), rotate: num , id: socket_id });
    };
    ext.Obj_ang = function(str,num) {
        socket.emit('scratch/ang', { obj: $.inArray(str, list_obj), angle: num, id: socket_id });
    };
    ext.Obj_movex = function(str,num) {
        socket.emit('scratch/movex', { obj: $.inArray(str, list_obj), movex: num, id: socket_id });
    };
    ext.Obj_movey = function(str,num) {
        socket.emit('scratch/movey', { obj: $.inArray(str, list_obj), movey: num, id: socket_id });
    };
    ext.Obj_warp = function(str,num1,num2) {
        socket.emit('scratch/warp', { obj: $.inArray(str, list_obj), warpx: 0, warpy: 0, id: socket_id });
    };
    ext.Obj_hide = function(str) {
        socket.emit('scratch/hide', { obj: $.inArray(str, list_obj), id: socket_id });
    };
    ext.Obj_appear = function(str) {
        socket.emit('scratch/appear', { obj: $.inArray(str, list_obj), id: socket_id });
    };
    ext.Obj_getx = function(str1,str2) {
        return(obj_prop[$.inArray(str1, list_obj)][$.inArray(str2, list_obj)][list_obj.length-2]);
    };
    ext.Obj_gety = function(str1,str2) {
        return(obj_prop[$.inArray(str1, list_obj)][$.inArray(str2, list_obj)][list_obj.length-1]);
    };
    ext.Obj_gety = function(str1,str2,str3) {
        if(obj_prop[$.inArray(str1, list_obj)][$.inArray(str2, list_obj)][$.inArray(str3, list_obj)] != 0){
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
        socket.emit('scratch/send', { mes: str, id: socket_id });
    };
    // ブロックと関数のひも付け
    var descriptor = {
        blocks: [
            ['r', 'Socket ID', 'Obj_getid'],
            [' ', '%m.List_obj を %n 歩動かす', 'Obj_move', list_obj[0],10],
            [' ', '%m.List_obj を時計回りに %n 度回す', 'Obj_cw', 'ねこ', 15],
            [' ', '%m.List_obj を反時計回りに %n 度回す', 'Obj_rcw', 'ねこ', 15],
            [' ', '%m.List_obj を %n 度に向ける', 'Obj_ang', 'ねこ', 10],
            [' ', '%m.List_obj のx座標を %n ずつ変える', 'Obj_movex', 'ねこ', 10],
            [' ', '%m.List_obj のｙ座標を %n ずつ変える', 'Obj_movey', 'ねこ', 10],
            [' ', '%m.List_obj を真ん中に動かす', 'Obj_warp', 'ねこ'],
            [' ', '%m.List_obj を 表示する', 'Obj_appear', 'ねこ'],
            [' ', '%m.List_obj を 隠す', 'Obj_hide', 'ねこ'],
            ['r', '%m.List_member さんの %m.List_obj のx座標', 'Obj_getx', 'A', 'ねこ'],
            ['r', '%m.List_member さんの %m.List_obj のy座標', 'Obj_gety', 'A', 'ねこ'],
            ['b', '%m.List_member さんの %m.List_obj と自分の %m.List_obj が触れた', 'Obj_hit', 'A', 'ねこ', 'ねこ'],
            ['h', '%s を受け取ったとき','Obj_res','Hello'],
            [' ','%s を送る','Obj_send','Hello']
        ],
        menus:{
            List_member: list_mem,
            List_obj:list_obj
        }
    };

    // 最後にExtensionを登録する
    ScratchExtensions.register('Scratch 2 Co-learning', descriptor, ext);

})({});