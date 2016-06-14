(function(ext) {
    // shutdown時に呼ばれる
    ext._shutdown = function() {};

    // statusを返してやる。デバイスとつながってない時とかここで色々返せる。
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    // blockが呼び出された時に呼ばれる関数を登録する。
    // 下にあるdescriptorでブロックと関数のひも付けを行っている。
    ext.Obj_move = function(num) {
    };

    // ブロックと関数のひも付け
    var descriptor = {
        blocks: [
            [' ', '%n 歩動かす', 'Obj_move', '10'],
            [' ', '時計回りに %n 度回す', 'Obj_move', '15'],
            [' ', '反時計回りに %n 度回す', 'Obj_move', '15'],
            [' ', '%m.angle 度に向ける', 'Obj_move', '10']
        ],
        menus: {
            angle:['(90)右','(-90)左','(0)上','(180)下']
        },
    };

    // 最後にExtensionを登録する
    ScratchExtensions.register('Scratch 2 Co-learning', descriptor, ext);
})({});