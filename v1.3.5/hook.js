//offset
var base = null;
var me = null;

//functions
var addExp;
var changeHP;
var init;

var count = 0;

var monsters = {
  '7d6':'bat pet',
  '70e':'bat clone',
  '709':'shadow clone',
  'bbb':'plant',
  'bbf':'l_rock',
  'bc3':'skull',
  'bcc':'tree',
  'bce':'tree',
  'bc4':'skull',
  'bd2':'archer',
  'bca':'bats',
  'bc8':'chst',
  'bc5':'tree',
  'c12':'l_fire',
  '138d':'boss_tree',
  '138b':'boss_l_rock',
  '13a8':'boss_tornado',
  '138a':'boss_plant_3',
  '13b4':'boss_plant',
  '139a':'boss_spider',
  '138c':'boss_skull',
  '13a7':'boss_cactus',
  '13a2':'boss_bats',
  '13ae':'boss_drake_min',
  '13b0':'boss_meteor',
  '1397':'boss_rolls_l_rocks',
  '139d':'boss_bat_undead',
  '1399':'boss_wizard_l_meteor',
  '13a4':'boss_dog_charge',
  '13ab':'boss_dog_l_balls',
  '13a0':'boss_plants_4',
  '138e':'boss_archer_4',
  '139c':'boss_demon_l_fire'
}

function getMonster(id){
  var id_string = id.toString(16);
  var res = monsters[id_string];
  if (res == undefined)
    return id_string;
  return res;
}

Java.perform(function () {
// is not checked
//  var SignCheck = Java.use('com.habby.archero.SignCheck');
//
//  SignCheck.check.implementation = function(){
//    console.log('check');
//    return true;
//  }


  var addExp_addr = 0xb186b4;
  var init_addr = 0xb08e18;

  base = Module.findBaseAddress('libil2cpp.so');

  if (base != null){
    init = new NativeFunction(base.add(init_addr), 'pointer', ['pointer', 'pointer', 'int']);
    addExp = new NativeFunction(base.add(addExp_addr), 'pointer', ['pointer', 'float']); 

    Interceptor.attach(base.add(addExp_addr), {
      onEnter: function(args){
        if (me == null){
          me = args[0];
        }
      }
    });

    Interceptor.attach(base.add(init_addr), {
      onEnter: function(args){
        console.log('init: ' + args[0] + ' ' + args[1] + ' ' + getMonster(args[2]));
        // if CHARACTER
        if (args[2] > 1000 && args[2] < 1009){
          me = args[0];
          console.log('[*] new init');
          count = -1;
        } else {
          if (args[2] > 0x1380 && args[2] < 0x1400){
            console.log('[*] STATS');
            console.log('hp: ' + Memory.readInt(Memory.readPointer(args[1]).add(0x108)));
            //Memory.writeInt(Memory.readPointer(args[1]).add(0x108), 1000);
            //Memory.writeInt(Memory.readPointer(args[1]).add(0x1c8), 1000);
          }
        }

        count+=1;
      },
      onLeave: function(args){
        if (me != null && count == 0){
          console.log('HACK!');
          // INVICIBLE
          Memory.writeInt(me.add(0xa0), 100);

          // EXP
          Memory.writeInt(me.add(0x168), 25);
          //console.log(Memory.readInt(me.add(0x170)));
          //addExp(me, 7000);
        }
      }
    });

  //  changeHP = new NativeFunction(ptr(base+0xb0df44), 'long', ['pointer', 'int', 'long']);

  //  Interceptor.attach(ptr(base+0xB0DF44), {
  //    onEnter: function(args){
  //        //console.log('object: ' + args[0]);
  //        //console.log('unknown: ' + args[1]);
  //        //console.log('change_hp: ' + args[2].toInt32());
  //      }
  //    }
  //  });

  }
});
