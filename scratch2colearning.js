(function(ext) {
    var socket = io.connect('http://192.168.2.104:8080');
	//var $window = $(window);
	//var $x = $("#x"), $y = $("#y");
    // shutdown時に呼ばれる
    ext._shutdown = function() {};

    // statusを返してやる。デバイスとつながってない時とかここで色々返せる。
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    // blockが呼び出された時に呼ばれる関数を登録する。
    // 下にあるdescriptorでブロックと関数のひも付けを行っている。
    ext.Obj_move = function(num) {
        socket.emit('browser/move', { x: 1, y: 1 });
    };

    // ブロックと関数のひも付け
    var descriptor = {
        blocks: [
            [' ', '%s に接続する', 'Obj_move', '192.168.2.104'],
            [' ', '%m.List_obj を %n 歩動かす', 'Obj_move', '',10],
            [' ', '%m.List_obj を時計回りに %n 度回す', 'Obj_move', '', 15],
            [' ', '%m.List_obj を反時計回りに %n 度回す', 'Obj_move', '', 15],
            [' ', '%m.List_obj を %n 度に向ける', 'Obj_move', '', 10],
            [' ', '%m.List_obj のx座標を %n ずつ変える', 'Obj_move', '', 10],
            [' ', '%m.List_obj のｙ座標を %n ずつ変える', 'Obj_move', '', 10],
            ['r', '%m.List_member さんの %m.List_obj のx座標', 'Obj_move', '', ''],
            ['r', '%m.List_member さんの %m.List_obj のy座標', 'Obj_move', '', ''],
            ['h', '%s を受け取ったとき','Obj_move','Hello'],
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