(function(ext) {
    var socket = io.connect('http://192.168.2.104:8080');
    var socket_id = '';
    var members = ['A','B','C','D'];
    var objects = ['ねこ','モモンガ','カエル'];
    socket.on('connect', function() { 
        socket_id = socket.id;
     });
    // shutdown時に呼ばれる
    ext._shutdown = function() {};

    // statusを返してやる。デバイスとつながってない時とかここで色々返せる。
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };
    //サーバ側から受信した情報を反映させる
    socket.on('server/hello', function (data) {
        socket.emit('scratch/hello', { id: socket_id });
	});
    // blockが呼び出された時に呼ばれる関数を登録する。
    // 下にあるdescriptorでブロックと関数のひも付けを行っている。
    ext.Obj_connect = function(str) {
        socket.disconnets();
        var socket = io.connect('http://192.168.2.104:8080');
        alert('Now you connected '+ str);
    };
    ext.Obj_move = function(str,num) {
        socket.emit('scratch/move', { obj: str, move: num, id: socket_id });
    };
    ext.Obj_cw = function(str,num) {
        socket.emit('scratch/rotate', { obj: str, rotate: num, id: socket_id });
    };
    ext.Obj_rcw = function(str,num) {
        socket.emit('scratch/rotate', { obj: str, rotate: num * -1, id: socket_id });
    };
    ext.Obj_ang = function(str,num) {
        socket.emit('scratch/ang', { obj: str, angle: num, id: socket_id });
    };
    ext.Obj_movex = function(str,num) {
        socket.emit('scratch/movex', { obj: str, movex: num, id: socket_id });
    };
    ext.Obj_movey = function(str,num) {
        socket.emit('scratch/movey', { obj: str, movey: num, id: socket_id });
    };
    ext.Obj_movey = function(str,num1,num2) {
        socket.emit('scratch/warp', { obj: str, warpx: num1, warpy: num2, id: socket_id });
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
            List_member: members,
            List_obj:objects
        }
    };

    // 最後にExtensionを登録する
    ScratchExtensions.register('Scratch 2 Co-learning', descriptor, ext);

})({});