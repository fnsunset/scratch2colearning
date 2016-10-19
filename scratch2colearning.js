(function(ext) {
    var socket = io.connect('http://127.0.0.1:8080');
	var $window = $(window);
	var $x = $("#x"), $y = $("#y");
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
            [' ', '%s に接続する', 'Obj_move', '10'],
            [' ', '%n 歩動かす', 'Obj_move', '10'],
            [' ', '時計回りに %n 度回す', 'Obj_move', '15'],
            [' ', '反時計回りに %n 度回す', 'Obj_move', '15'],
            [' ', '%n 度に向ける', 'Obj_move', '10'],
            [' ', 'x座標を %n ずつ変える', 'Obj_move', '10'],
            [' ', 'ｙ座標を %n ずつ変える', 'Obj_move', '10'],
            ['r', '%m.List_member さんの %m.List_xy ', 'Obj_move', '']
        ],
        menus:{
            List_member: ['A','B','C','D'],
            List_xy:['x座標','y座標']
        }
    };

    // 最後にExtensionを登録する
    ScratchExtensions.register('Scratch 2 Co-learning', descriptor, ext);

})({});