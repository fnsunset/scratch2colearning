(function(ext) {
    alert("2");
    var socket = io.connect('http://192.168.2.104:8080');
    var socket_id = '';
    var list_mem = ['A','B','C','D'];
    var list_obj = ['ねこ','モモンガ','カエル'];
    var obj_prop = [[],[]];//obj_propは[a]さんの[b]のobj
    obj_prop[0][0] = 0;
    var allobj = list_mem.length * list_obj.length;
    alert("配列の長さは"+list_mem.length+"と"+list_obj.length);
    for(var cnta=0; cnta < allobj; cnta++){
        for(var cntb=0; cntb < list_obj.length; cntb++){
            obj_prop[cnta][cntb] = 0;
        }
    }
    var say = new Array;    //メッセージの送受信を記録に残す用

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
    //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//

    //サーバ側から接続完了後のメッセージを受け取ったらIDを返す
    socket.on('server/hello', function (data) {
        socket.emit('scratch/hello', { id: socket_id });
	});

    //ここまで

    // blockが呼び出された時に呼ばれる関数を登録する。
    // 下にあるdescriptorでブロックと関数のひも付けを行っている。
    ext.Obj_connect = function(str) {
        //接続は起動時にやってるので必要ないのでは？
    };
    ext.Obj_move = function(str,num) {
        socket.emit('scratch/move', { obj: $.inArray(str, list_obj), move: num, id: socket_id });
    };
    ext.Obj_cw = function(str,num) {
        socket.emit('scratch/rotate', { obj: $.inArray(str, list_obj), rotate: num, id: socket_id });
    };
    ext.Obj_rcw = function(str,num) {
        socket.emit('scratch/rotate', { obj: $.inArray(str, list_obj), rotate: num * -1, id: socket_id });
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
    ext.Obj_movey = function(str,num1,num2) {
        socket.emit('scratch/warp', { obj: $.inArray(str, list_obj), warpx: num1, warpy: num2, id: socket_id });
    };
    ext.Obj_getx = function(str1,str2) {
        socket.emit('scratch/getx', { x: 1, y: 1 });
    };
    ext.Obj_gety = function(str1,str2) {
        socket.emit('scratch/gety', { x: 1, y: 1 });
    };
    ext.Obj_res = function(str) {
        socket.emit('scratch/res', { x: 1, y: 1 });
    };
    ext.Obj_send = function(str) {
        socket.emit('scratch/send', { mes: str, id: socket_id });
    };
    // ブロックと関数のひも付け
    var descriptor = {
        blocks: [
            [' ', '%s に接続する', 'Obj_connect', '192.168.2.104:8080'],
            [' ', '%m.List_obj を %n 歩動かす', 'Obj_move', 'ねこ',10],
            [' ', '%m.List_obj を時計回りに %n 度回す', 'Obj_cw', 'ねこ', 15],
            [' ', '%m.List_obj を反時計回りに %n 度回す', 'Obj_rcw', 'ねこ', 15],
            [' ', '%m.List_obj を %n 度に向ける', 'Obj_ang', 'ねこ', 10],
            [' ', '%m.List_obj のx座標を %n ずつ変える', 'Obj_movex', 'ねこ', 10],
            [' ', '%m.List_obj のｙ座標を %n ずつ変える', 'Obj_movey', 'ねこ', 10],
            [' ', '%m.List_obj のx座標を %n y座標を %n にする', 'Obj_warp', 'ねこ', 0, 0],
            ['r', '%m.List_member さんの %m.List_obj のx座標', 'Obj_getx', 'A', 'ねこ'],
            ['r', '%m.List_member さんの %m.List_obj のy座標', 'Obj_gety', 'A', 'ねこ'],
            ['h', '%s を受け取ったとき','Obj_res','Hello'],
            [' ','%s を送る','Obj_move','Hello']
        ],
        menus:{
            List_member: list_mem,
            List_obj:list_obj
        }
    };

    // 最後にExtensionを登録する
    ScratchExtensions.register('Scratch 2 Co-learning', descriptor, ext);

})({});