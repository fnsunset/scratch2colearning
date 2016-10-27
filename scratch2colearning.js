(function(ext) {
    var socket = io.connect('http://192.168.2.104:8080');
    
    // shutdown時に呼ばれる
    ext._shutdown = function() {};

    // statusを返してやる。デバイスとつながってない時とかここで色々返せる。
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    // blockが呼び出された時に呼ばれる関数を登録する。
    // 下にあるdescriptorでブロックと関数のひも付けを行っている。
    ext.Obj_connect = function(str) {
        socket.emit('scratch/connect', { x: 1, y: 1 });
    };
    ext.Obj_move = function(str,num) {
        socket.emit('scratch/move', { x: 1, y: 1 });
    };
    ext.Obj_cw = function(str,num) {
        socket.emit('scratch/cw', { x: 1, y: 1 });
    };
    ext.Obj_rcw = function(str,num) {
        socket.emit('scratch/rcw', { x: 1, y: 1 });
    };
    ext.Obj_ang = function(str,num) {
        socket.emit('scratch/ang', { x: 1, y: 1 });
    };
    ext.Obj_movex = function(str,num) {
        socket.emit('scratch/movex', { x: 1, y: 1 });
    };
    ext.Obj_movey = function(str,num) {
        socket.emit('scratch/movey', { x: 1, y: 1 });
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
        socket.emit('scratch/send', { x: 1, y: 1 });
    };
    // ブロックと関数のひも付け
    var descriptor = {
        blocks: [
            [' ', '%s に接続する', 'Obj_connect', '192.168.2.104'],
            [' ', '%m.List_obj を %n 歩動かす', 'Obj_move', '',10],
            [' ', '%m.List_obj を時計回りに %n 度回す', 'Obj_cw', '', 15],
            [' ', '%m.List_obj を反時計回りに %n 度回す', 'Obj_rcw', '', 15],
            [' ', '%m.List_obj を %n 度に向ける', 'Obj_ang', '', 10],
            [' ', '%m.List_obj のx座標を %n ずつ変える', 'Obj_movex', '', 10],
            [' ', '%m.List_obj のｙ座標を %n ずつ変える', 'Obj_movey', '', 10],
            ['r', '%m.List_member さんの %m.List_obj のx座標', 'Obj_getx', '', ''],
            ['r', '%m.List_member さんの %m.List_obj のy座標', 'Obj_gety', '', ''],
            ['h', '%s を受け取ったとき','Obj_res','Hello'],
            [' ','%s を送る','Obj_move','Hello']
        ],
        menus:{
            List_member: ['A','B','C','D'],
            List_obj:['ねこ','モモンガ']
        }
    };

    // 最後にExtensionを登録する
    ScratchExtensions.register('Scratch 2 Co-learning', descriptor, ext);

})({});