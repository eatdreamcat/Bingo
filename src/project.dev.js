window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  AudioController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9e9e7nIyP5BGquwjN7hFiaR", "AudioController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var HashMap_1 = require("../Utils/HashMap");
    var EventManager_1 = require("./EventManager");
    var EventName_1 = require("./EventName");
    var AudioController = function() {
      function AudioController() {
        this.audioID = {};
        this.clips = new HashMap_1.HashMap();
      }
      Object.defineProperty(AudioController, "inst", {
        get: function() {
          return this.ins ? this.ins : this.ins = new AudioController();
        },
        enumerable: true,
        configurable: true
      });
      AudioController.prototype.init = function(callback) {
        console.warn(" start load AudioClip ");
        var self = this;
        cc.loader.loadResDir("preloadSounds", cc.AudioClip, function(err, clips, urls) {
          if (err) console.error(err); else {
            for (var _i = 0, clips_1 = clips; _i < clips_1.length; _i++) {
              var clip = clips_1[_i];
              "string" == typeof clip["_audio"] && cc.loader["_cache"] && cc.loader["_cache"][clip["_audio"]] && cc.loader["_cache"][clip["_audio"]]["buffer"] && (clip["_audio"] = cc.loader["_cache"][clip["_audio"]]["buffer"]);
              self.clips.add(clip.name, clip);
            }
            self.initEvent();
            callback && callback();
          }
        });
      };
      AudioController.prototype.initEvent = function() {
        var _this = this;
        EventManager_1.gEventMgr.targetOff(this);
        this.audioID["bgm"] = this.play("bgm", true, 1, true);
        EventManager_1.gEventMgr.on(EventName_1.GlobalEvent.SMALL_BGM, function() {
          null != _this.audioID["bgm"] && cc.audioEngine.setVolume(_this.audioID["bgm"], .5);
        }, this);
        EventManager_1.gEventMgr.on(EventName_1.GlobalEvent.NORMAL_BGM, function() {
          null != _this.audioID["bgm"] && cc.audioEngine.setVolume(_this.audioID["bgm"], 1);
        }, this);
        EventManager_1.gEventMgr.on(EventName_1.GlobalEvent.CHANGE_BGM, function(name) {
          if (null != _this.audioID["bgm"]) {
            _this.stop(_this.audioID["bgm"], "bgm");
            _this.audioID["bgm"] = _this.play(name, true, 1, true);
          }
        }, this);
        EventManager_1.gEventMgr.on(EventName_1.GlobalEvent.PLAY_EFFECT, function(name) {
          _this.audioID[name] = _this.play(name);
        }, this);
      };
      AudioController.prototype.stop = function(audioID, clipName) {
        if (AudioController.canPlay) cc.audioEngine.stop(audioID); else for (var _i = 0, _a = AudioController.PlayedList; _i < _a.length; _i++) {
          var clipItem = _a[_i];
          clipItem.skip = clipItem.clipName == clipName;
        }
      };
      AudioController.prototype.play = function(clipName, loop, volume, isBgm, timePass) {
        var _this = this;
        void 0 === loop && (loop = false);
        void 0 === volume && (volume = 1);
        void 0 === isBgm && (isBgm = false);
        void 0 === timePass && (timePass = 0);
        if (!AudioController.canPlay && !AudioController.hasBindTouch) {
          AudioController.hasBindTouch = true;
          var self_1 = this;
          var playFunc_1 = function() {
            cc.game.canvas.removeEventListener("touchstart", playFunc_1);
            AudioController.canPlay = true;
            var item;
            while ((item = AudioController.PlayedList.pop()) && self_1.clips.get(item.clipName) && !item.skip) {
              var audioID = cc.audioEngine.play(self_1.clips.get(item.clipName), item.loop, item.volume);
              if (item.isBgm) {
                self_1.audioID["bgm"] = audioID;
                cc.audioEngine.setCurrentTime(audioID, (Date.now() - item.supTime) / 1e3 % cc.audioEngine.getDuration(audioID));
              } else cc.audioEngine.setCurrentTime(audioID, (Date.now() - item.supTime) / 1e3);
            }
          };
          cc.game.canvas.addEventListener("touchstart", playFunc_1);
        }
        if (!this.clips.get(clipName)) {
          var now_1 = Date.now();
          cc.loader.loadRes("sounds/" + clipName, cc.AudioClip, function(err, clip) {
            if (err) console.error(err); else {
              "string" == typeof clip["_audio"] && cc.loader["_cache"] && cc.loader["_cache"][clip["_audio"]] && cc.loader["_cache"][clip["_audio"]]["buffer"] && (clip["_audio"] = cc.loader["_cache"][clip["_audio"]]["buffer"]);
              _this.clips.add(clip.name, clip);
              var pass = (Date.now() - now_1) / 1e3;
              _this.audioID[clipName] = _this.play(clipName, loop, volume, isBgm, pass);
            }
          });
          return -1;
        }
        if (AudioController.canPlay) {
          var audioID = cc.audioEngine.play(this.clips.get(clipName), loop, volume);
          cc.audioEngine.setCurrentTime(audioID, timePass % cc.audioEngine.getDuration(audioID));
          return audioID;
        }
        var hasAdd = false;
        for (var _i = 0, _a = AudioController.PlayedList; _i < _a.length; _i++) {
          var clipItem = _a[_i];
          if (clipItem.clipName == clipName) {
            hasAdd = true;
            break;
          }
        }
        if (hasAdd) return -2;
        AudioController.PlayedList.push({
          clipName: clipName,
          loop: loop,
          volume: volume,
          supTime: Date.now() - timePass / 1e3,
          skip: false,
          isBgm: isBgm
        });
        return -2;
      };
      AudioController.PlayedList = [];
      AudioController.canPlay = cc.sys.os.toLowerCase() != cc.sys.OS_IOS.toLowerCase();
      AudioController.hasBindTouch = false;
      return AudioController;
    }();
    exports.gAudio = AudioController.inst;
    cc._RF.pop();
  }, {
    "../Utils/HashMap": "HashMap",
    "./EventManager": "EventManager",
    "./EventName": "EventName"
  } ],
  Card: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "abb83Mso7xFbKdwnWlntVp4", "Card");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var EventManager_1 = require("./Controller/EventManager");
    var Const_1 = require("./Const");
    var Game_1 = require("./Controller/Game");
    var Point_1 = require("./Point");
    var EventName_1 = require("./Controller/EventName");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var Card = function(_super) {
      __extends(Card, _super);
      function Card() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.bingoTimes = 0;
        _this.nextTurnTime = 0;
        _this.mouseHideTime = 0;
        return _this;
      }
      Object.defineProperty(Card.prototype, "Wrong", {
        get: function() {
          return this.node.getChildByName("Wrong");
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Card.prototype, "Word", {
        get: function() {
          return this.word;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Card.prototype, "Index", {
        get: function() {
          return this.index;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Card.prototype, "BingoTimesLabel", {
        get: function() {
          return this.node.getChildByName("BingoTimes").getComponent(cc.Label);
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Card.prototype, "Pos", {
        get: function() {
          return Const_1.CardWord[this.word] + "." + this.index;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Card.prototype, "StringValue", {
        get: function() {
          return this.word + "." + this.value;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Card.prototype, "Star", {
        get: function() {
          return this.node.getChildByName("Star");
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Card.prototype, "NumberLabel", {
        get: function() {
          return this.node.getChildByName("Number").getComponent(cc.Label);
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Card.prototype, "Bingo", {
        get: function() {
          return this.node.getChildByName("Bingo");
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Card.prototype, "Mouse", {
        get: function() {
          return this.node.getChildByName("Mouse");
        },
        enumerable: true,
        configurable: true
      });
      Card.prototype.setPageIndex = function(index) {
        this.pageIndex = index;
      };
      Card.prototype.reuse = function() {
        this.setPageIndex(arguments[0][3]);
        this.setValue(arguments[0][2]);
        this.setIndex(arguments[0][1]);
        this.setWord(arguments[0][0]);
        this.bingoTimes = 0;
        this.Wrong.active = false;
        this.Mouse.active = false;
        for (var _i = 0, _a = this.Bingo.children; _i < _a.length; _i++) {
          var child = _a[_i];
          child.active = false;
        }
        this.Star.active = false;
        this.Bingo.getChildByName(this.bingoTimes.toString()).active = Const_1.StarCard.indexOf(this.Pos) >= 0;
        if (Const_1.StarCard.indexOf(this.Pos) >= 0) {
          Game_1.Game.delCurrentCardValue(this.pageIndex, this.value);
          Game_1.Game.addHighLightCard(this.pageIndex);
        }
        this.initEvent();
        console.log(" pos:", Const_1.CardWord[this.word] + "." + this.index);
      };
      Card.prototype.unuse = function() {
        EventManager_1.gEventMgr.targetOff(this);
        this.node.targetOff(this);
      };
      Card.prototype.initEvent = function() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onCardTouch, this);
        EventManager_1.gEventMgr.on(EventName_1.GlobalEvent.CHANGE_GAME_MODE, this.onGameModeChange, this);
      };
      Card.prototype.update = function(dt) {
        if (Game_1.Game.getCurMode() == Const_1.SkillType.Super && this.nextTurnTime > 0 && this.mouseHideTime > 0 && !this.isLight()) {
          Date.now() >= this.nextTurnTime && (this.Mouse.active = true);
          if (Date.now() >= this.mouseHideTime) {
            this.Mouse.active = false;
            this.nextTurnTime = Date.now() + 1e3 * CMath.getRandom(Const_1.SuperTime.RandomMin, Const_1.SuperTime.RandomMax);
            this.mouseHideTime = this.nextTurnTime + 1e3 * CMath.getRandom(Const_1.SuperTime.ShowTimeMin, Const_1.SuperTime.ShowTimeMax);
          }
        }
      };
      Card.prototype.onGameModeChange = function() {
        if (Game_1.Game.getCurMode() != Const_1.SkillType.Super) {
          this.Mouse.active = false;
          this.nextTurnTime = 0;
        } else {
          this.nextTurnTime = Date.now() + 1e3 * CMath.getRandom(Const_1.SuperTime.RandomMin, Const_1.SuperTime.RandomMax);
          this.mouseHideTime = this.nextTurnTime + 1e3 * CMath.getRandom(Const_1.SuperTime.ShowTimeMin, Const_1.SuperTime.ShowTimeMax);
        }
      };
      Card.prototype.isLight = function() {
        for (var _i = 0, _a = this.Bingo.children; _i < _a.length; _i++) {
          var child = _a[_i];
          if (child.active) return true;
        }
        return this.Star.active;
      };
      Card.prototype.isMouse = function() {
        return this.Mouse.active;
      };
      Card.prototype.onCardTouch = function(e) {
        if (this.isLight()) return;
        var score = 0;
        var scoreType = Const_1.ScoreType.Normal;
        if (Game_1.Game.getCurMode() == Const_1.SkillType.Normal) {
          var currentReward = Game_1.Game.CurrentReward.children[0];
          if (currentReward && currentReward.getComponent(Point_1.default)) {
            var point = currentReward.getComponent(Point_1.default);
            if (point.TimeLeftPercent > 0 && point.StringValue == this.StringValue) {
              var percentCost = 1 - point.TimeLeftPercent;
              if (percentCost <= Const_1.TimeScorePercent.Perfect) {
                score = Const_1.Score.Normal + Const_1.Score.Perfect;
                scoreType = Const_1.ScoreType.Perfect;
              } else if (percentCost <= Const_1.TimeScorePercent.Great) {
                score = Const_1.Score.Normal + Const_1.Score.Great * (Const_1.TimeScorePercent.Great - percentCost) / (Const_1.TimeScorePercent.Great - Const_1.TimeScorePercent.Perfect);
                scoreType = Const_1.ScoreType.Great;
              } else {
                score = Const_1.Score.Normal + Const_1.Score.Nice * (1 - percentCost) / Const_1.TimeScorePercent.Great;
                scoreType = Const_1.ScoreType.Nice;
              }
            } else point.addTime(-point.TotalTime / 5);
          }
          for (var _i = 0, _a = Game_1.Game.RewardArray.children; _i < _a.length; _i++) {
            var child = _a[_i];
            var point = child.getComponent(Point_1.default);
            if (point && point.StringValue == this.StringValue) {
              score = Const_1.Score.Normal;
              scoreType = Const_1.ScoreType.Normal;
            }
          }
          score = Math.ceil(score);
        } else if (Game_1.Game.getCurMode() == Const_1.SkillType.Star) {
          score = Const_1.Score.Normal + Const_1.Score.Perfect;
          scoreType = Const_1.ScoreType.Perfect;
        } else if (Game_1.Game.getCurMode() == Const_1.SkillType.Gold) {
          if (this.value == Game_1.Game.goldSelectValue) {
            score = Const_1.Score.Normal + Const_1.Score.Perfect;
            scoreType = Const_1.ScoreType.Perfect;
          }
        } else if (Game_1.Game.getCurMode() == Const_1.SkillType.Super && this.isMouse()) {
          score = Const_1.Score.Normal + Const_1.Score.Perfect;
          scoreType = Const_1.ScoreType.Perfect;
        }
        if (score > 0) {
          this.turnStar();
          Game_1.Game.addScore(scoreType, score, 1);
          EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.CHECK_BINGO, this, Const_1.RectCard.indexOf(this.Pos) >= 0);
        } else {
          Game_1.Game.addScore(Const_1.ScoreType.Oops, Const_1.Score.Oops, 1);
          this.showWrong();
        }
        Game_1.Game.getCurMode() != Const_1.SkillType.Normal && Game_1.Game.getCurMode() != Const_1.SkillType.Super && EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.SKILL_DONE);
      };
      Card.prototype.showWrong = function() {
        var _this = this;
        if (this.Wrong.active || this.Wrong.getNumberOfRunningActions() > 0) return;
        this.Wrong.opacity = 0;
        this.Wrong.active = true;
        this.Wrong.runAction(cc.sequence(cc.fadeIn(.1), cc.delayTime(.05), cc.fadeOut(.05), cc.callFunc(function() {
          _this.Wrong.active = false;
        })));
      };
      Card.prototype.turnStar = function() {
        this.Star.active = true;
        this.Mouse.stopAllActions();
        this.Mouse.active = false;
        Game_1.Game.addHighLightCard(this.pageIndex);
      };
      Card.prototype.setValue = function(val) {
        this.value = val;
        this.NumberLabel.string = this.value.toString();
      };
      Card.prototype.setIndex = function(ind) {
        this.index = ind;
      };
      Card.prototype.setWord = function(word) {
        this.word = word;
      };
      Card.prototype.isBingo = function() {
        return this.bingoTimes >= 1;
      };
      Card.prototype.bingo = function() {
        if (!this.isLight()) {
          console.error(" this card can not bingo:", this.Pos);
          return 0;
        }
        this.bingoTimes++;
        for (var _i = 0, _a = this.Bingo.children; _i < _a.length; _i++) {
          var child = _a[_i];
          child.active = parseInt(child.name) <= this.bingoTimes;
        }
        var score = 0;
        if (this.bingoTimes >= 2) {
          Game_1.Game.addOverBingoTimes(this.pageIndex);
          var bingoTimes = Game_1.Game.getTotalBingoTimes();
          score = bingoTimes * Const_1.Score.BingoStep;
        }
        return score;
      };
      Card.prototype.start = function() {};
      Card = __decorate([ ccclass ], Card);
      return Card;
    }(cc.Component);
    exports.default = Card;
    cc._RF.pop();
  }, {
    "./Const": "Const",
    "./Controller/EventManager": "EventManager",
    "./Controller/EventName": "EventName",
    "./Controller/Game": "Game",
    "./Point": "Point"
  } ],
  CelerSDK: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ed9c4kHhRZCyKBWDxdeArVs", "CelerSDK");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Game_1 = require("./Game");
    var celerx = require("../Utils/celerx");
    var CelerSDK = function() {
      function CelerSDK() {
        this.alreadySubmit = false;
        this.isNewPlayer = false;
        this.celerStartCallback = null;
        this.isInCeler = false;
        var errLog_1;
        false;
      }
      Object.defineProperty(CelerSDK, "inst", {
        get: function() {
          return this.ins ? this.ins : this.ins = new CelerSDK();
        },
        enumerable: true,
        configurable: true
      });
      CelerSDK.prototype.init = function(callback) {
        this.alreadySubmit = false;
        celerx.onStart(this.onCelerStart.bind(this));
        celerx.provideScore(function() {
          return parseInt(Game_1.Game.getScore().toString());
        });
        this.celerStartCallback = callback;
      };
      CelerSDK.prototype.celerXReady = function() {
        celerx.ready();
        true;
        this.onCelerStart();
      };
      CelerSDK.prototype.isNew = function() {
        return this.isNewPlayer;
      };
      CelerSDK.prototype.isOnCelerPlatform = function() {
        return this.isInCeler;
      };
      CelerSDK.prototype.onCelerStart = function() {
        var match = celerx.getMatch();
        if (match && match.sharedRandomSeed) {
          CMath.randomSeed = match.sharedRandomSeed;
          CMath.sharedSeed = match.sharedRandomSeed;
          this.isInCeler = true;
        } else {
          this.isInCeler = false;
          CMath.randomSeed = Math.random();
        }
        match && match.shouldLaunchTutorial || true ? this.isNewPlayer = true : this.isNewPlayer = false;
        var takeImage = false;
        var canvas = document.getElementsByTagName("canvas")[0];
        cc.director.on(cc.Director.EVENT_AFTER_DRAW, function() {
          if (takeImage) {
            takeImage = false;
            celerx.didTakeSnapshot(canvas.toDataURL("image/jpeg", .1));
          }
        });
        celerx.provideCurrentFrameData(function() {
          takeImage = true;
        });
        if (this.celerStartCallback) {
          this.celerStartCallback();
          this.celerStartCallback = null;
        }
      };
      CelerSDK.prototype.submitScore = function(score) {
        if (this.alreadySubmit) return;
        this.alreadySubmit = true;
        celerx.submitScore(score);
      };
      return CelerSDK;
    }();
    exports.CelerSDK = CelerSDK;
    cc._RF.pop();
  }, {
    "../Utils/celerx": "celerx",
    "./Game": "Game"
  } ],
  Const: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6380cLWFRRCbqDZ1T+XmugM", "Const");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.GameTime = 1200;
    exports.SkillTimeBouns = 20;
    var SkillType;
    (function(SkillType) {
      SkillType[SkillType["Time"] = 0] = "Time";
      SkillType[SkillType["Star"] = 1] = "Star";
      SkillType[SkillType["Gold"] = 2] = "Gold";
      SkillType[SkillType["Super"] = 3] = "Super";
      SkillType[SkillType["Normal"] = 4] = "Normal";
    })(SkillType = exports.SkillType || (exports.SkillType = {}));
    exports.MaxSkillEquipCount = 3;
    var Theme;
    (function(Theme) {
      Theme[Theme["Wheel"] = 0] = "Wheel";
      Theme[Theme["Carousel"] = 1] = "Carousel";
      Theme[Theme["Roller"] = 2] = "Roller";
    })(Theme = exports.Theme || (exports.Theme = {}));
    exports.ThemePool = [ Theme.Carousel, Theme.Roller, Theme.Wheel ];
    exports.RewardTime = {
      One: 3.25,
      Two: 2.9
    };
    exports.TimeScorePercent = {
      Perfect: .2,
      Great: .5
    };
    var ScoreType;
    (function(ScoreType) {
      ScoreType[ScoreType["Perfect"] = 0] = "Perfect";
      ScoreType[ScoreType["Great"] = 1] = "Great";
      ScoreType[ScoreType["Nice"] = 2] = "Nice";
      ScoreType[ScoreType["Normal"] = 3] = "Normal";
      ScoreType[ScoreType["Oops"] = 4] = "Oops";
      ScoreType[ScoreType["Bingo"] = 5] = "Bingo";
      ScoreType[ScoreType["BingoFail"] = 6] = "BingoFail";
      ScoreType[ScoreType["OverBingo"] = 7] = "OverBingo";
      ScoreType[ScoreType["AllBingo"] = 8] = "AllBingo";
    })(ScoreType = exports.ScoreType || (exports.ScoreType = {}));
    exports.ToolPercent = {
      0: .8,
      1: .5,
      2: .4,
      3: 0,
      4: 0
    };
    exports.ScoreText = {
      0: "font_perfect",
      1: "font_great",
      2: "font_nice",
      3: "",
      4: "font_oops"
    };
    exports.UI_Atlas = {
      Bingo_Blue_Up: "btn_bingo_blue_up",
      Bingo_Blue_Down: "btn_bingo_blue_down",
      Bingo_Orange_Up: "btn_bingo_orange_up",
      Bingo_Orange_Down: "btn_bingo_orange_down",
      Skill_Full: "bg_skill_full",
      Skill_Normal: "bg_skill_get",
      Skill_Icon_Star: "bg_skill_1",
      Skill_Icon_Gold: "bg_skill_2",
      Skill_Icon_Time: "bg_skill_3",
      Super_Skill_Down: "btn_change_down",
      Super_Skill_Up: "btn_change_up",
      Super_Skill_Gray: "btn_change_gray"
    };
    exports.Score = {
      Perfect: 50,
      Great: 30,
      Nice: 20,
      Normal: 100,
      Oops: -25,
      Bingo: 1e3,
      BingoStep: 100,
      BingoFail: -100,
      AllBingo: 3e3
    };
    exports.TimeLimit = 91;
    exports.RewardListLimit = 4;
    exports.CardNumber = {
      Min: 2,
      Max: 3
    };
    var PrefabName;
    (function(PrefabName) {
      PrefabName["Score"] = "Score";
      PrefabName["Card"] = "Card";
      PrefabName["Point"] = "Point";
    })(PrefabName = exports.PrefabName || (exports.PrefabName = {}));
    exports.TargetRange = {
      Start: 1,
      End: 75
    };
    exports.CardStep = 15;
    var CardWord;
    (function(CardWord) {
      CardWord[CardWord["B"] = 1] = "B";
      CardWord[CardWord["I"] = 2] = "I";
      CardWord[CardWord["N"] = 3] = "N";
      CardWord[CardWord["G"] = 4] = "G";
      CardWord[CardWord["O"] = 5] = "O";
    })(CardWord = exports.CardWord || (exports.CardWord = {}));
    exports.PointColor = {
      0: cc.color(79, 130, 233),
      1: cc.color(229, 103, 236),
      2: cc.color(145, 85, 212),
      3: cc.color(42, 197, 183),
      4: cc.color(231, 209, 125)
    };
    exports.StarCard = [ "N.3" ];
    exports.RectCard = [ "B.1", "O.1", "B.5", "O.5" ];
    var OverType;
    (function(OverType) {
      OverType[OverType["TimeUp"] = 0] = "TimeUp";
      OverType[OverType["PoolClear"] = 1] = "PoolClear";
      OverType[OverType["CardClear"] = 2] = "CardClear";
    })(OverType = exports.OverType || (exports.OverType = {}));
    exports.TotalSkillCount = 5;
    exports.SkillPercentRange = {
      Max: 140,
      Min: 11
    };
    exports.GoldSkillTimeLimit = {
      Select: 7,
      Click: 4
    };
    exports.SuperTime = {
      LastTime: 60,
      RandomMin: 2,
      RandomMax: 10,
      ShowTimeMin: .2,
      ShowTimeMax: .6
    };
    cc._RF.pop();
  }, {} ],
  EventManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "abedd8TuIVPHo+8lpclbjlp", "EventManager");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var EventManager = function() {
      function EventManager() {
        this.eventTarget = new cc.EventTarget();
      }
      Object.defineProperty(EventManager, "inst", {
        get: function() {
          return this.ins ? this.ins : this.ins = new EventManager();
        },
        enumerable: true,
        configurable: true
      });
      EventManager.prototype.emit = function(type, arg1, arg2, arg3, arg4, arg5) {
        this.eventTarget.emit(type.toString(), arg1, arg2, arg3, arg4, arg5);
      };
      EventManager.prototype.on = function(type, callback, target, useCapture) {
        return this.eventTarget.on(type.toString(), callback, target, useCapture);
      };
      EventManager.prototype.once = function(type, callback, target) {
        this.eventTarget.once(type.toString(), callback, target);
      };
      EventManager.prototype.dispatchEvent = function(event) {
        this.eventTarget.dispatchEvent(event);
      };
      EventManager.prototype.off = function(type, callback, target) {
        this.eventTarget.off(type.toString(), callback, target);
      };
      EventManager.prototype.hasEventListener = function(type) {
        return this.eventTarget.hasEventListener(type.toString());
      };
      EventManager.prototype.targetOff = function(target) {
        this.eventTarget.targetOff(target);
      };
      return EventManager;
    }();
    exports.gEventMgr = EventManager.inst;
    cc._RF.pop();
  }, {} ],
  EventName: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5e448W2wb5EB7XC2O5CyNch", "EventName");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var GlobalEvent;
    (function(GlobalEvent) {
      GlobalEvent[GlobalEvent["PLAY_EFFECT"] = 0] = "PLAY_EFFECT";
      GlobalEvent[GlobalEvent["CHANGE_BGM"] = 1] = "CHANGE_BGM";
      GlobalEvent[GlobalEvent["SMALL_BGM"] = 2] = "SMALL_BGM";
      GlobalEvent[GlobalEvent["NORMAL_BGM"] = 3] = "NORMAL_BGM";
      GlobalEvent[GlobalEvent["ADD_SCORE"] = 4] = "ADD_SCORE";
      GlobalEvent[GlobalEvent["GAME_OVER"] = 5] = "GAME_OVER";
      GlobalEvent[GlobalEvent["ADD_2_NORMAL_REWARD"] = 6] = "ADD_2_NORMAL_REWARD";
      GlobalEvent[GlobalEvent["CHECK_BINGO"] = 7] = "CHECK_BINGO";
      GlobalEvent[GlobalEvent["UPDATE_TOOL_PERCENT"] = 8] = "UPDATE_TOOL_PERCENT";
      GlobalEvent[GlobalEvent["SKILL_DONE"] = 9] = "SKILL_DONE";
      GlobalEvent[GlobalEvent["GOLD_POINT_SELECT_DONE"] = 10] = "GOLD_POINT_SELECT_DONE";
      GlobalEvent[GlobalEvent["CHANGE_GAME_MODE"] = 11] = "CHANGE_GAME_MODE";
    })(GlobalEvent = exports.GlobalEvent || (exports.GlobalEvent = {}));
    cc._RF.pop();
  }, {} ],
  GameFactory: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4ba85CHTExANJR6/Hab8WvI", "GameFactory");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var HashMap_1 = require("../Utils/HashMap");
    var ObjPool = function() {
      function ObjPool(template, initSize, poolHandlerComps) {
        this._pool = [];
        this.poolHandlerComps = [];
        this.poolHandlerComps = poolHandlerComps;
        this.template = template;
        this.initPool(initSize);
      }
      ObjPool.prototype.initPool = function(size) {
        for (var i = 0; i < size; ++i) {
          var newNode = cc.instantiate(this.template);
          this.put(newNode);
        }
      };
      ObjPool.prototype.size = function() {
        return this._pool.length;
      };
      ObjPool.prototype.clear = function() {
        var count = this._pool.length;
        for (var i = 0; i < count; ++i) this._pool[i].destroy && this._pool[i].destroy();
        this._pool.length = 0;
      };
      ObjPool.prototype.put = function(obj) {
        if (obj && -1 === this._pool.indexOf(obj)) {
          obj.removeFromParent(false);
          if (this.poolHandlerComps) {
            var handlers = this.poolHandlerComps;
            for (var _i = 0, handlers_1 = handlers; _i < handlers_1.length; _i++) {
              var handler = handlers_1[_i];
              var comp = obj.getComponent(handler);
              comp && comp.unuse && comp.unuse.apply(comp);
            }
          } else {
            var handlers = obj.getComponents(cc.Component);
            for (var _a = 0, handlers_2 = handlers; _a < handlers_2.length; _a++) {
              var handler = handlers_2[_a];
              handler && handler.unuse && handler.unuse.apply(handler);
            }
          }
          this._pool.push(obj);
        }
      };
      ObjPool.prototype.get = function() {
        var _ = [];
        for (var _i = 0; _i < arguments.length; _i++) _[_i] = arguments[_i];
        var last = this._pool.length - 1;
        if (last < 0) {
          console.warn(" last < 0 ");
          this.initPool(1);
        }
        last = this._pool.length - 1;
        var obj = this._pool[last];
        this._pool.length = last;
        if (this.poolHandlerComps) {
          var handlers = this.poolHandlerComps;
          for (var _a = 0, handlers_3 = handlers; _a < handlers_3.length; _a++) {
            var handler = handlers_3[_a];
            var comp = obj.getComponent(handler);
            comp && comp.reuse && comp.reuse.apply(comp, arguments);
          }
        } else {
          var handlers = obj.getComponents(cc.Component);
          for (var _b = 0, handlers_4 = handlers; _b < handlers_4.length; _b++) {
            var handler = handlers_4[_b];
            handler && handler.reuse && handler.reuse.apply(handler, arguments);
          }
        }
        return obj;
      };
      return ObjPool;
    }();
    var GameFactory = function() {
      function GameFactory() {
        this.objPool = new HashMap_1.HashMap();
      }
      Object.defineProperty(GameFactory, "inst", {
        get: function() {
          return this.ins ? this.ins : this.ins = new GameFactory();
        },
        enumerable: true,
        configurable: true
      });
      GameFactory.prototype.init = function(callback) {
        var _this = this;
        this.doneCallback = callback;
        cc.loader.loadResDir("prefabs/", cc.Prefab, function(err, res, urls) {
          if (err) console.error(" Game Factory init failed:", err); else {
            for (var _i = 0, res_1 = res; _i < res_1.length; _i++) {
              var prefab = res_1[_i];
              var nameSplit = prefab.name.split(".");
              var name = nameSplit[0];
              var count = nameSplit[1] ? parseInt(nameSplit[1]) : 30;
              console.log(" init pool:", name, ", count:", count);
              var objPool = new ObjPool(prefab, count);
              _this.objPool.add(name, objPool);
            }
            _this.doneCallback();
          }
        });
      };
      GameFactory.prototype.getObj = function(name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) args[_i - 1] = arguments[_i];
        if (this.objPool.has(name)) return this.objPool.get(name).get(args);
        console.error(" objPool dosen't exists this obj:", name);
        return null;
      };
      GameFactory.prototype.putObj = function(name, node) {
        if (this.objPool.has(name)) return this.objPool.get(name).put(node);
        console.error(" objPool dosen't exists this obj:", name);
      };
      return GameFactory;
    }();
    exports.gFactory = GameFactory.inst;
    cc._RF.pop();
  }, {
    "../Utils/HashMap": "HashMap"
  } ],
  GameScene: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "641d0IYt6xLgqqVz9F0bymV", "GameScene");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var GameFactory_1 = require("./Controller/GameFactory");
    var EventManager_1 = require("./Controller/EventManager");
    var StepController_1 = require("./Controller/StepController");
    var AudioController_1 = require("./Controller/AudioController");
    var EventName_1 = require("./Controller/EventName");
    var Game_1 = require("./Controller/Game");
    var Guide_1 = require("./Guide");
    var CelerSDK_1 = require("./Controller/CelerSDK");
    var Const_1 = require("./Const");
    var Pad_1 = require("./UI/Pad");
    var Card_1 = require("./Card");
    var GoldSkillLayer_1 = require("./GoldSkillLayer");
    var SuperSkillLayer_1 = require("./SuperSkillLayer");
    var Step;
    (function(Step) {
      Step["Prefab"] = "Prefab";
      Step["Audio"] = "Audio";
    })(Step || (Step = {}));
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var GameScene = function(_super) {
      __extends(GameScene, _super);
      function GameScene() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.Background = null;
        _this.TopNode = null;
        _this.TimeLabel = null;
        _this.ScoreLabel = null;
        _this.PageTabButtonRoot = null;
        _this.CardPages = null;
        _this.CurrentPoint = null;
        _this.NextPoint = null;
        _this.PointArray = null;
        _this.RecycleArray = null;
        _this.Guide = null;
        _this.TextAtlas = null;
        _this.UIAtlas = null;
        _this.ToolBar = null;
        _this.BingoButton = null;
        _this.SuperSkillButton = null;
        _this.SkillRoot = null;
        _this.SuperSkillBar = null;
        _this.CurrentSkillProgressLabel = null;
        _this.TotalSkillProgressLabel = null;
        _this.StarSkillLayer = null;
        _this.GoldSkillLayer = null;
        _this.SuperSkillLayer = null;
        _this.showScore = 0;
        _this.score = 0;
        _this.addScoreStep = 0;
        _this.scoreNodeCache = [];
        _this.toolPercent = 0;
        return _this;
      }
      GameScene.prototype.onLoad = function() {
        Game_1.Game.TopNode = this.TopNode;
        Game_1.Game.CurrentReward = this.CurrentPoint;
        Game_1.Game.RewardArray = this.PointArray;
        this.PageTabButtonRoot.active = false;
        this.ToolBar.progress = 0;
        this.StarSkillLayer.active = false;
        this.GoldSkillLayer.hide();
        this.SuperSkillLayer.hide();
        CelerSDK_1.CelerSDK.inst.init(this.celerOnStart.bind(this));
        StepController_1.gStep.register(this.celerReady.bind(this), [ Step.Audio, Step.Prefab ]);
        Game_1.Game.prepare();
        for (var _i = 0, _a = this.Background.children; _i < _a.length; _i++) {
          var child = _a[_i];
          child.active = child.name == Const_1.Theme[Game_1.Game.Theme];
        }
        AudioController_1.gAudio.init(function() {
          StepController_1.gStep.nextStep(Step.Audio);
        });
        GameFactory_1.gFactory.init(function() {
          StepController_1.gStep.nextStep(Step.Prefab);
        });
        this.initEvent();
      };
      GameScene.prototype.celerReady = function() {
        CelerSDK_1.CelerSDK.inst.celerXReady();
      };
      GameScene.prototype.celerOnStart = function() {
        CelerSDK_1.CelerSDK.inst.isNew();
        Game_1.Game.start();
        this.initGameScene();
      };
      GameScene.prototype.updateSuperSkillProgress = function() {
        this.TotalSkillProgressLabel.string = Const_1.TotalSkillCount.toString();
        this.CurrentSkillProgressLabel.string = Game_1.Game.getCurrentSkillUseCount().toString();
        var percent = Game_1.Game.getSkillUsePercent();
        this.SuperSkillBar.active = percent < 1;
        this.SuperSkillBar.height = percent * (Const_1.SkillPercentRange.Max - Const_1.SkillPercentRange.Min) + Const_1.SkillPercentRange.Min;
        this.SuperSkillButton.interactable = percent >= 1;
      };
      GameScene.prototype.updateButtonGroup = function() {
        for (var _i = 0, _a = this.PageTabButtonRoot.children; _i < _a.length; _i++) {
          var child = _a[_i];
          child.getChildByName("Normal").active = child.getComponent(cc.Button).interactable;
          child.getChildByName("Press").active = !child.getChildByName("Normal").active;
          child.getComponent(cc.Button).interactable ? child.getChildByName("Text").opacity = 127.5 : child.getChildByName("Text").opacity = 255;
        }
      };
      GameScene.prototype.setButtonGroupDefault = function() {
        for (var _i = 0, _a = this.PageTabButtonRoot.children; _i < _a.length; _i++) {
          var child = _a[_i];
          child.getChildByName("Press").group = "default";
          child.getChildByName("Text").group = "default";
        }
      };
      GameScene.prototype.setButtonGroupUI = function() {
        for (var _i = 0, _a = this.PageTabButtonRoot.children; _i < _a.length; _i++) {
          var child = _a[_i];
          child.getChildByName("Press").group = "UI";
          child.getChildByName("Text").group = "UI";
        }
      };
      GameScene.prototype.initGameScene = function() {
        var pageNumber = Game_1.Game.getCardNumber();
        this.PageTabButtonRoot.active = !(pageNumber <= 1);
        var tabCount = this.PageTabButtonRoot.childrenCount;
        for (var i = 1; i <= tabCount; i++) {
          var child = this.PageTabButtonRoot.getChildByName(i.toString());
          if (child && i > pageNumber) child.removeFromParent(true); else {
            child.on(cc.Node.EventType.TOUCH_START, this.scrollCardPage, this);
            1 == i && (child.getComponent(cc.Button).interactable = false);
          }
        }
        this.updateButtonGroup();
        console.log(" tab button count:", this.PageTabButtonRoot.childrenCount);
        this.PageTabButtonRoot.active = pageNumber > 1;
        var padCount = this.CardPages.content.childrenCount;
        for (var i = 1; i <= padCount; i++) {
          var child = this.CardPages.content.getChildByName(i.toString());
          child && i > pageNumber ? this.CardPages.removePage(child) : child.addComponent(Pad_1.default);
        }
        console.log(" pad count:", this.CardPages.content.childrenCount);
        this.CardPages.node.on("scroll-ended", this.onPageTurnDone, this);
        this.CardPages["_unregisterEvent"]();
        for (var _i = 0, _a = this.CardPages.content.children; _i < _a.length; _i++) {
          var pad = _a[_i];
          for (var i = Const_1.CardWord.B; i <= Const_1.CardWord.O; i++) {
            var randomPool = [];
            var randomIndex = [];
            for (var j = 0; j < 15; j++) randomIndex.push(j);
            randomPool.length = randomIndex.length;
            for (var j = (i - 1) * Const_1.CardStep + 1; j <= i * Const_1.CardStep; j++) {
              var index = Math.floor(CMath.getRandom(0, randomIndex.length));
              randomPool[randomIndex[index]] = j;
              randomIndex.splice(index, 1);
            }
            console.log(" -------- randomPool ------------");
            console.log(randomPool);
            for (var j = 1; j <= 5; j++) {
              var value = randomPool.pop();
              var pageIndex = parseInt(pad.name) - 1;
              Game_1.Game.addCurrentCardValue(pageIndex, value);
              var card = GameFactory_1.gFactory.getObj("Card", i, j, value, pageIndex);
              pad.addChild(card);
            }
          }
        }
        this.onCurrentPointRemoveChild(null);
        this.updateSuperSkillProgress();
        this.updateToolPercent();
      };
      GameScene.prototype.onPageTurnDone = function() {
        for (var _i = 0, _a = this.PageTabButtonRoot.children; _i < _a.length; _i++) {
          var child = _a[_i];
          child.getComponent(cc.Button).interactable = child.name != (this.CardPages.getCurrentPageIndex() + 1).toString();
        }
        this.updateButtonGroup();
        this.updateBingoButton();
      };
      GameScene.prototype.scrollCardPage = function(e) {
        if (Game_1.Game.getCurMode() != Const_1.SkillType.Normal) return;
        for (var _i = 0, _a = this.PageTabButtonRoot.children; _i < _a.length; _i++) {
          var child = _a[_i];
          e.target == child ? child.getComponent(cc.Button).interactable = false : child.getComponent(cc.Button).interactable = true;
        }
        this.updateButtonGroup();
        this.CardPages.scrollToPage(parseInt(e.target.name) - 1, 0);
        this.updateBingoButton();
      };
      GameScene.prototype.initEvent = function() {
        EventManager_1.gEventMgr.targetOff(this);
        this.CurrentPoint.on(cc.Node.EventType.CHILD_REMOVED, this.onCurrentPointRemoveChild, this);
        this.TopNode.getChildByName("ScoreRoot").on(cc.Node.EventType.CHILD_REMOVED, this.onScoreRootRemoveChild, this);
        this.BingoButton.node.on(cc.Node.EventType.TOUCH_END, this.Bingo, this);
        this.SuperSkillButton.node.on(cc.Node.EventType.TOUCH_END, this.superSkill, this);
        EventManager_1.gEventMgr.on(EventName_1.GlobalEvent.ADD_2_NORMAL_REWARD, this.addNormalReward, this);
        EventManager_1.gEventMgr.on(EventName_1.GlobalEvent.ADD_SCORE, this.addScore, this);
        EventManager_1.gEventMgr.on(EventName_1.GlobalEvent.CHECK_BINGO, this.CheckBingo, this);
        EventManager_1.gEventMgr.on(EventName_1.GlobalEvent.UPDATE_TOOL_PERCENT, this.updateToolPercent, this);
        EventManager_1.gEventMgr.on(EventName_1.GlobalEvent.SKILL_DONE, this.skillDone, this);
      };
      GameScene.prototype.Bingo = function() {
        if (Game_1.Game.canBingo(this.CardPages.getCurrentPageIndex())) {
          var bingo = Game_1.Game.popBingoCache(this.CardPages.getCurrentPageIndex());
          if (bingo) {
            Game_1.Game.addScore(Const_1.ScoreType.Bingo, bingo.score, 1);
            var overBingoScore = 0;
            for (var _i = 0, _a = bingo.cards; _i < _a.length; _i++) {
              var card = _a[_i];
              overBingoScore += card.bingo();
            }
            Game_1.Game.addScore(Const_1.ScoreType.OverBingo, overBingoScore, 1);
          }
          this.updateBingoButton();
        } else Game_1.Game.addScore(Const_1.ScoreType.BingoFail, Const_1.Score.BingoFail, 1, CMath.ConvertToNodeSpaceAR(this.BingoButton.node, this.TopNode));
      };
      GameScene.prototype.updateBingoButton = function() {
        if (Game_1.Game.canBingo(this.CardPages.getCurrentPageIndex())) {
          this.BingoButton.normalSprite = this.UIAtlas.getSpriteFrame(Const_1.UI_Atlas.Bingo_Orange_Up);
          this.BingoButton.hoverSprite = this.UIAtlas.getSpriteFrame(Const_1.UI_Atlas.Bingo_Orange_Up);
          this.BingoButton.pressedSprite = this.UIAtlas.getSpriteFrame(Const_1.UI_Atlas.Bingo_Orange_Down);
        } else {
          this.BingoButton.normalSprite = this.UIAtlas.getSpriteFrame(Const_1.UI_Atlas.Bingo_Blue_Up);
          this.BingoButton.hoverSprite = this.UIAtlas.getSpriteFrame(Const_1.UI_Atlas.Bingo_Blue_Up);
          this.BingoButton.pressedSprite = this.UIAtlas.getSpriteFrame(Const_1.UI_Atlas.Bingo_Blue_Down);
        }
      };
      GameScene.prototype.CheckBingo = function(lastCard, checkRect) {
        void 0 === checkRect && (checkRect = false);
        var currentPageIndex = this.CardPages.getCurrentPageIndex() + 1;
        console.log(" current page index:", currentPageIndex);
        var currentPage = this.CardPages.content.getChildByName(currentPageIndex.toString());
        var rectArr = [];
        var oppositeDiagonal = [];
        var positiveDiagonal = [];
        var rowArr = [];
        var colArr = [];
        for (var _i = 0, _a = currentPage.children; _i < _a.length; _i++) {
          var child = _a[_i];
          var card = child.getComponent(Card_1.default);
          if (card) {
            Const_1.RectCard.indexOf(card.Pos) >= 0 && checkRect && card.isLight() && rectArr.push(card);
            card.Index == card.Word && lastCard.Index == lastCard.Word && card.isLight() && positiveDiagonal.push(card);
            card.Index + card.Word == 6 && lastCard.Index + lastCard.Word == 6 && card.isLight() && oppositeDiagonal.push(card);
            if (!card.isLight()) continue;
            card.Index == lastCard.Index && rowArr.push(card);
            card.Word == lastCard.Word && colArr.push(card);
          }
        }
        var bingoArray = [];
        var score = 0;
        rectArr.length < 4 && (rectArr.length = 0);
        if (rectArr.length > 0) {
          console.log(" ------------- \u56db\u8fb9\u89d2 ------------");
          bingoArray = bingoArray.concat(rectArr);
          score += Const_1.Score.Bingo;
          var logArr = [];
          for (var _b = 0, rectArr_1 = rectArr; _b < rectArr_1.length; _b++) {
            var card = rectArr_1[_b];
            logArr.push(card.Pos);
          }
          console.log(logArr);
        }
        oppositeDiagonal.length < 5 && (oppositeDiagonal.length = 0);
        if (oppositeDiagonal.length > 0) {
          console.log(" -------- \u53cd\u5bf9\u89d2 ----------");
          bingoArray = bingoArray.concat(oppositeDiagonal);
          score += Const_1.Score.Bingo;
          var logArr = [];
          for (var _c = 0, oppositeDiagonal_1 = oppositeDiagonal; _c < oppositeDiagonal_1.length; _c++) {
            var card = oppositeDiagonal_1[_c];
            logArr.push(card.Pos);
          }
          console.log(logArr);
        }
        positiveDiagonal.length < 5 && (positiveDiagonal.length = 0);
        if (positiveDiagonal.length > 0) {
          console.log(" ---------- \u6b63\u5bf9\u89d2 ------------");
          bingoArray = bingoArray.concat(positiveDiagonal);
          score += Const_1.Score.Bingo;
          var logArr = [];
          for (var _d = 0, positiveDiagonal_1 = positiveDiagonal; _d < positiveDiagonal_1.length; _d++) {
            var card = positiveDiagonal_1[_d];
            logArr.push(card.Pos);
          }
          console.log(logArr);
        }
        rowArr.length < 5 && (rowArr.length = 0);
        if (rowArr.length > 0) {
          console.log(" -------------  \u7ad6\u5411 ---------------");
          bingoArray = bingoArray.concat(rowArr);
          score += Const_1.Score.Bingo;
          var logArr = [];
          for (var _e = 0, rowArr_1 = rowArr; _e < rowArr_1.length; _e++) {
            var card = rowArr_1[_e];
            logArr.push(card.Pos);
          }
          console.log(logArr);
        }
        colArr.length < 5 && (colArr.length = 0);
        if (colArr.length > 0) {
          console.log(" ----------------- \u6a2a\u5411 ---------------");
          bingoArray = bingoArray.concat(colArr);
          score += Const_1.Score.Bingo;
          var logArr = [];
          for (var _f = 0, colArr_1 = colArr; _f < colArr_1.length; _f++) {
            var card = colArr_1[_f];
            logArr.push(card.Pos);
          }
          console.log(logArr);
        }
        bingoArray.length > 0 && Game_1.Game.pushBingoCache(this.CardPages.getCurrentPageIndex(), {
          cards: bingoArray,
          score: score
        });
        this.updateBingoButton();
      };
      GameScene.prototype.onCurrentPointRemoveChild = function(child) {
        var _this = this;
        if (this.NextPoint.childrenCount <= 0) {
          var point_1 = GameFactory_1.gFactory.getObj("Point", Game_1.Game.getNextPoint());
          this.NextPoint.addChild(point_1);
          point_1.x = 0;
          point_1.y = 0;
          point_1.scale = 0;
          point_1.runAction(cc.sequence(cc.scaleTo(.15, 1), cc.callFunc(function() {
            point_1.setParent(_this.CurrentPoint);
            point_1.x = 0;
            point_1.y = 0;
          })));
        }
      };
      GameScene.prototype.addNormalReward = function(point) {
        var _this = this;
        var delay = 0;
        if (this.PointArray.childrenCount >= 4) {
          var lastPoint_1 = this.PointArray.children[0];
          lastPoint_1.setPosition(CMath.ConvertToNodeSpaceAR(lastPoint_1, this.RecycleArray));
          lastPoint_1.setParent(this.RecycleArray);
          delay = .1;
          lastPoint_1.runAction(cc.sequence(cc.scaleTo(.1, .5), cc.moveTo(.15, 0, 0), cc.callFunc(function() {
            GameFactory_1.gFactory.putObj("Point", lastPoint_1);
          })));
        }
        for (var _i = 0, _a = this.PointArray.children; _i < _a.length; _i++) {
          var child = _a[_i];
          child.runAction(cc.sequence(cc.delayTime(delay), cc.moveBy(.15, -child.width - 20, 0)));
        }
        point.runAction(cc.sequence(cc.delayTime(delay), cc.callFunc(function() {
          point.setPosition(CMath.ConvertToNodeSpaceAR(point, _this.PointArray));
          point.setParent(_this.PointArray);
        }), cc.spawn(cc.moveTo(.15, 0, 0), cc.scaleTo(.15, .9))));
      };
      GameScene.prototype.addScore = function(type, score, scale, pos) {
        var _this = this;
        void 0 === pos && (pos = cc.v2(49, 704));
        var totalScore = Game_1.Game.getScore();
        var scoreLabel = GameFactory_1.gFactory.getObj(Const_1.PrefabName.Score, score, scale, this.ScoreLabel.node, function() {
          _this.score = totalScore;
          _this.addScoreStep = (_this.score - _this.showScore) / 20;
          GameFactory_1.gFactory.putObj(Const_1.PrefabName.Score, scoreLabel);
          console.log(" score:", _this.score, " , show:", _this.showScore, ", step:", _this.addScoreStep);
        }, this.TextAtlas.getSpriteFrame(Const_1.ScoreText[type]));
        scoreLabel.setPosition(pos);
        this.TopNode.getChildByName("ScoreRoot").childrenCount > 0 ? this.scoreNodeCache.push(scoreLabel) : this.TopNode.getChildByName("ScoreRoot").addChild(scoreLabel);
      };
      GameScene.prototype.onScoreRootRemoveChild = function(child) {
        this.scoreNodeCache.length > 0 && this.TopNode.getChildByName("ScoreRoot").addChild(this.scoreNodeCache.shift());
      };
      GameScene.prototype.updateTimeCount = function() {
        var time = Math.floor(Game_1.Game.getGameTime());
        if (time > 5) return;
        var font = this.TimeLabel.node.getChildByName("font").getComponent(cc.Sprite);
        EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.PLAY_EFFECT, "count");
        font.node.runAction(cc.sequence(cc.fadeTo(.2, 255), cc.scaleTo(.1, 1.2), cc.delayTime(.5), cc.scaleTo(.1, 1), cc.fadeTo(.1, 0)));
      };
      GameScene.prototype.updateToolPercent = function() {
        this.SkillRoot.childrenCount >= Const_1.MaxSkillEquipCount && this.toolPercent >= 1 ? this.ToolBar.barSprite.spriteFrame = this.UIAtlas.getSpriteFrame(Const_1.UI_Atlas.Skill_Full) : this.ToolBar.barSprite.spriteFrame = this.UIAtlas.getSpriteFrame(Const_1.UI_Atlas.Skill_Normal);
        this.toolPercent = Game_1.Game.getToolPercent();
      };
      GameScene.prototype.addSkill = function() {
        var skill = Game_1.Game.getSkill();
        var skillCallback;
        var icon = "";
        console.log(" \u83b7\u5f97\u6280\u80fd:", Const_1.SkillType[skill]);
        switch (skill) {
         case Const_1.SkillType.Gold:
          skillCallback = this.goldSkill.bind(this);
          icon = Const_1.UI_Atlas.Skill_Icon_Gold;
          break;

         case Const_1.SkillType.Star:
          skillCallback = this.starSkill.bind(this);
          icon = Const_1.UI_Atlas.Skill_Icon_Star;
          break;

         case Const_1.SkillType.Time:
          skillCallback = this.timeSkill.bind(this);
          icon = Const_1.UI_Atlas.Skill_Icon_Time;
        }
        var skillButton = GameFactory_1.gFactory.getObj("Skill", skillCallback, this.UIAtlas.getSpriteFrame(icon), skill);
        this.SkillRoot.addChild(skillButton);
        skillButton.zIndex = this.SkillRoot.childrenCount;
      };
      GameScene.prototype.starSkill = function() {
        console.log("  \u84dd\u8272\u9053\u5177");
        if (Game_1.Game.checkIsFull(this.CardPages.getCurrentPageIndex())) {
          console.log(" \u6b64\u5361\u7247\u5df2\u7ecf\u5168\u90e8\u70b9\u6ee1");
          return;
        }
        this.updateSuperSkillProgress();
        if (Game_1.Game.getToolPercent() >= 1) {
          Game_1.Game.clearToolPercent();
          this.toolPercent = Game_1.Game.getToolPercent();
        }
        Game_1.Game.pause();
        this.StarSkillLayer.active = true;
        Game_1.Game.setCurClickMode(Const_1.SkillType.Star);
        this.setButtonGroupDefault();
      };
      GameScene.prototype.skillDone = function() {
        Game_1.Game.resume();
        Game_1.Game.setCurClickMode(Const_1.SkillType.Normal);
        this.StarSkillLayer.active = false;
        this.GoldSkillLayer.hide();
        this.SuperSkillLayer.hide();
        this.setButtonGroupUI();
      };
      GameScene.prototype.goldSkill = function() {
        console.log(" \u91d1\u8272\u9053\u5177");
        if (Game_1.Game.checkIsFull(this.CardPages.getCurrentPageIndex())) {
          console.log(" \u6b64\u5361\u7247\u5df2\u7ecf\u5168\u90e8\u70b9\u6ee1");
          return;
        }
        this.updateSuperSkillProgress();
        if (Game_1.Game.getToolPercent() >= 1) {
          Game_1.Game.clearToolPercent();
          this.toolPercent = Game_1.Game.getToolPercent();
        }
        Game_1.Game.pause();
        this.GoldSkillLayer.show(this.CardPages.getCurrentPageIndex());
        Game_1.Game.setCurClickMode(Const_1.SkillType.Gold);
        this.setButtonGroupDefault();
      };
      GameScene.prototype.timeSkill = function() {
        console.log(" \u65f6\u95f4\u9053\u5177");
        Game_1.Game.addGameTime(Const_1.SkillTimeBouns);
        this.updateSuperSkillProgress();
        if (Game_1.Game.getToolPercent() >= 1) {
          Game_1.Game.clearToolPercent();
          this.toolPercent = Game_1.Game.getToolPercent();
        }
      };
      GameScene.prototype.superSkill = function() {
        console.log(" \u8d85\u7ea7\u9053\u5177");
        if (Game_1.Game.checkIsFull(this.CardPages.getCurrentPageIndex())) {
          console.log(" \u6b64\u5361\u7247\u5df2\u7ecf\u5168\u90e8\u70b9\u6ee1");
          return;
        }
        Game_1.Game.pause();
        Game_1.Game.clearSkillUseCount();
        Game_1.Game.setCurClickMode(Const_1.SkillType.Super);
        this.updateSuperSkillProgress();
        this.setButtonGroupDefault();
        this.SuperSkillLayer.show();
      };
      GameScene.prototype.update = function(dt) {
        if (Game_1.Game.isStart) {
          if (!this.Guide.node.active && !Game_1.Game.isPause()) {
            Game_1.Game.addGameTime(-dt);
            this.TimeLabel.string = CMath.TimeFormat(Game_1.Game.getGameTime());
            if (30 == Math.floor(Game_1.Game.getGameTime()) && this.TimeLabel.node.getChildByName("noTime") && this.TimeLabel.node.getChildByName("noTime").opacity <= 0) {
              this.TimeLabel.getComponent(cc.Animation).play();
              EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.CHANGE_BGM, "bgm_30");
            }
            this.updateTimeCount();
          }
          if (this.ToolBar.progress != this.toolPercent) {
            var step = 0 == this.toolPercent ? -.1 : this.toolPercent > this.ToolBar.progress ? .01 : -.01;
            this.ToolBar.progress += step;
            (step > 0 && this.ToolBar.progress > this.toolPercent || step < 0 && this.ToolBar.progress < this.toolPercent) && (this.ToolBar.progress = this.toolPercent);
            this.ToolBar.progress = CMath.Clamp(this.ToolBar.progress, 1, 0);
            if (this.ToolBar.progress >= 1 && Game_1.Game.getToolPercent() >= 1 && this.SkillRoot.childrenCount < Const_1.MaxSkillEquipCount) {
              if (this.SkillRoot.childrenCount < Const_1.MaxSkillEquipCount - 1) {
                Game_1.Game.clearToolPercent();
                this.toolPercent = Game_1.Game.getToolPercent();
              } else this.ToolBar.barSprite.spriteFrame = this.UIAtlas.getSpriteFrame(Const_1.UI_Atlas.Skill_Full);
              this.addSkill();
            }
          }
          if (this.showScore != this.score) {
            this.showScore += this.addScoreStep;
            (this.addScoreStep > 0 && this.showScore > this.score || this.addScoreStep < 0 && this.showScore < this.score) && (this.showScore = this.score);
            this.ScoreLabel.string = Math.floor(this.showScore).toString();
          }
        }
      };
      __decorate([ property(cc.Node) ], GameScene.prototype, "Background", void 0);
      __decorate([ property(cc.Node) ], GameScene.prototype, "TopNode", void 0);
      __decorate([ property(cc.Label) ], GameScene.prototype, "TimeLabel", void 0);
      __decorate([ property(cc.Label) ], GameScene.prototype, "ScoreLabel", void 0);
      __decorate([ property(cc.Node) ], GameScene.prototype, "PageTabButtonRoot", void 0);
      __decorate([ property(cc.PageView) ], GameScene.prototype, "CardPages", void 0);
      __decorate([ property(cc.Node) ], GameScene.prototype, "CurrentPoint", void 0);
      __decorate([ property(cc.Node) ], GameScene.prototype, "NextPoint", void 0);
      __decorate([ property(cc.Node) ], GameScene.prototype, "PointArray", void 0);
      __decorate([ property(cc.Node) ], GameScene.prototype, "RecycleArray", void 0);
      __decorate([ property(Guide_1.default) ], GameScene.prototype, "Guide", void 0);
      __decorate([ property(cc.SpriteAtlas) ], GameScene.prototype, "TextAtlas", void 0);
      __decorate([ property(cc.SpriteAtlas) ], GameScene.prototype, "UIAtlas", void 0);
      __decorate([ property(cc.ProgressBar) ], GameScene.prototype, "ToolBar", void 0);
      __decorate([ property(cc.Button) ], GameScene.prototype, "BingoButton", void 0);
      __decorate([ property(cc.Button) ], GameScene.prototype, "SuperSkillButton", void 0);
      __decorate([ property(cc.Node) ], GameScene.prototype, "SkillRoot", void 0);
      __decorate([ property(cc.Node) ], GameScene.prototype, "SuperSkillBar", void 0);
      __decorate([ property(cc.Label) ], GameScene.prototype, "CurrentSkillProgressLabel", void 0);
      __decorate([ property(cc.Label) ], GameScene.prototype, "TotalSkillProgressLabel", void 0);
      __decorate([ property(cc.Node) ], GameScene.prototype, "StarSkillLayer", void 0);
      __decorate([ property(GoldSkillLayer_1.default) ], GameScene.prototype, "GoldSkillLayer", void 0);
      __decorate([ property(SuperSkillLayer_1.default) ], GameScene.prototype, "SuperSkillLayer", void 0);
      GameScene = __decorate([ ccclass ], GameScene);
      return GameScene;
    }(cc.Component);
    exports.default = GameScene;
    cc._RF.pop();
  }, {
    "./Card": "Card",
    "./Const": "Const",
    "./Controller/AudioController": "AudioController",
    "./Controller/CelerSDK": "CelerSDK",
    "./Controller/EventManager": "EventManager",
    "./Controller/EventName": "EventName",
    "./Controller/Game": "Game",
    "./Controller/GameFactory": "GameFactory",
    "./Controller/StepController": "StepController",
    "./GoldSkillLayer": "GoldSkillLayer",
    "./Guide": "Guide",
    "./SuperSkillLayer": "SuperSkillLayer",
    "./UI/Pad": "Pad"
  } ],
  Game: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "af369eKsM9Cn4vz3KUTDwcJ", "Game");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var EventManager_1 = require("./EventManager");
    var EventName_1 = require("./EventName");
    var Const_1 = require("../Const");
    var HashMap_1 = require("../Utils/HashMap");
    var GameCtrl = function() {
      function GameCtrl() {
        this.CurrentReward = null;
        this.RewardArray = null;
        this.TopNode = null;
        this.FontRoot = null;
        this.score = 0;
        this.bingoScore = {};
        this.overBingoTimes = new HashMap_1.HashMap();
        this.numberRandomPool = [];
        this.currentCardPool = new HashMap_1.HashMap();
        this.skillUseCount = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.cardAllBingoCount = 0;
        this.highLightCardCount = new HashMap_1.HashMap();
        this.goldSelectValue = 0;
        this.currentSkillPool = [];
        this.skillUsedRecord = [];
        this.totalOverBingoTimes = 0;
        this.totalHighLightCount = 0;
        this.bingoCache = new HashMap_1.HashMap();
        this.toolPercent = 0;
        this.gameTime = 0;
        this.ispause = false;
        this.cardNumber = 0;
        this.isStart = false;
      }
      Object.defineProperty(GameCtrl, "inst", {
        get: function() {
          return this.ins ? this.ins : this.ins = new GameCtrl();
        },
        enumerable: true,
        configurable: true
      });
      GameCtrl.prototype.start = function() {
        this.ispause = false;
        this.isStart = true;
      };
      GameCtrl.prototype.pause = function() {
        this.ispause = true;
      };
      GameCtrl.prototype.resume = function() {
        this.ispause = false;
      };
      GameCtrl.prototype.addAllBingoCardCount = function(count) {
        this.cardAllBingoCount += count;
      };
      GameCtrl.prototype.getNextPoint = function() {
        if (this.numberRandomPool.length > 0) return this.numberRandomPool.pop();
        EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.GAME_OVER, Const_1.OverType.PoolClear);
        return 0;
      };
      GameCtrl.prototype.setCurClickMode = function(mode) {
        if (this.curClickMode == mode) return;
        this.curClickMode = mode;
        EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.CHANGE_GAME_MODE);
      };
      GameCtrl.prototype.getCurMode = function() {
        return this.curClickMode;
      };
      GameCtrl.prototype.getScore = function() {
        return this.score;
      };
      GameCtrl.prototype.addScore = function(type, score, scale, pos) {
        if (0 == score) return;
        this.score += score;
        score > 0 ? this.addStreak() : this.clearStreak();
        this.score = Math.max(0, this.score);
        this.addBingoScore(type, score);
        EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.ADD_SCORE, type, score, scale, pos);
      };
      GameCtrl.prototype.addStreak = function() {
        this.streak++;
        this.maxStreak++;
      };
      GameCtrl.prototype.clearStreak = function() {
        this.streak = 0;
      };
      GameCtrl.prototype.getCardNumber = function() {
        return this.cardNumber;
      };
      GameCtrl.prototype.addToolPercent = function(percent) {
        if ("number" != typeof percent) return;
        if (this.toolPercent >= 1) return;
        this.toolPercent += percent;
        this.toolPercent = Math.min(this.toolPercent, 1);
        EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.UPDATE_TOOL_PERCENT);
      };
      GameCtrl.prototype.clearToolPercent = function() {
        this.toolPercent = 0;
      };
      GameCtrl.prototype.getToolPercent = function() {
        return this.toolPercent;
      };
      GameCtrl.prototype.pushBingoCache = function(pageIndex, bingos) {
        this.bingoCache.has(pageIndex) ? this.bingoCache.get(pageIndex).push(bingos) : this.bingoCache.add(pageIndex, [ bingos ]);
      };
      GameCtrl.prototype.popBingoCache = function(pageIndex) {
        if (this.bingoCache.has(pageIndex)) {
          var bingo = this.bingoCache.get(pageIndex).pop();
          this.bingoCache.get(pageIndex).length <= 0 && this.bingoCache.remove(pageIndex);
          return bingo;
        }
        return null;
      };
      GameCtrl.prototype.canBingo = function(pageIndex) {
        return this.bingoCache.has(pageIndex) && this.bingoCache.get(pageIndex).length > 0;
      };
      GameCtrl.prototype.addCurrentCardValue = function(pageIndex, val) {
        this.currentCardPool.has(pageIndex) ? this.currentCardPool.get(pageIndex).push(val) : this.currentCardPool.add(pageIndex, [ val ]);
      };
      GameCtrl.prototype.delCurrentCardValue = function(pageIndex, val) {
        if (!this.currentCardPool.has(pageIndex)) return;
        var index = this.currentCardPool.get(pageIndex).indexOf(val);
        if (index >= 0) {
          this.currentCardPool.get(pageIndex).splice(index, 1);
          this.currentCardPool.get(pageIndex).length <= 0 && this.currentCardPool.remove(pageIndex);
        }
        this.currentCardPool.length <= 0 && EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.GAME_OVER, Const_1.OverType.CardClear);
      };
      GameCtrl.prototype.getNextCurrentCardPoint = function(pageIndex, random, del) {
        void 0 === random && (random = false);
        void 0 === del && (del = true);
        if (!this.currentCardPool.has(pageIndex)) return 0;
        if (this.currentCardPool.length > 0) {
          var pointVal = 0;
          if (random) {
            var randomIndex = Math.floor(CMath.getRandom(0, this.currentCardPool.length));
            pointVal = this.currentCardPool.get(pageIndex)[randomIndex];
            del && this.currentCardPool.get(pageIndex).splice(randomIndex, 1);
          } else if (del) pointVal = this.currentCardPool.get(pageIndex).pop(); else {
            var last = this.currentCardPool.get(pageIndex).length - 1;
            pointVal = this.currentCardPool.get(pageIndex)[last];
          }
          this.currentCardPool.get(pageIndex).length <= 0 && this.currentCardPool.remove(pageIndex);
          return pointVal;
        }
        EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.GAME_OVER, Const_1.OverType.CardClear);
        return 0;
      };
      GameCtrl.prototype.getOverBingoTimes = function(pageIndex) {
        return this.overBingoTimes.get(pageIndex);
      };
      GameCtrl.prototype.getTotalBingoTimes = function() {
        return this.totalOverBingoTimes;
      };
      GameCtrl.prototype.addHighLightCard = function(pageIndex) {
        this.highLightCardCount.has(pageIndex) || this.highLightCardCount.add(pageIndex, 0);
        this.highLightCardCount.add(pageIndex, this.highLightCardCount.get(pageIndex) + 1);
        this.curClickMode == Const_1.SkillType.Super && this.highLightCardCount.get(pageIndex) >= 25 && EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.SKILL_DONE);
        this.totalHighLightCount++;
        console.log("--------\u5361\u7247-", pageIndex, "- \u70b9\u4eae:", this.highLightCardCount.get(pageIndex), " \u5f20", " , \u603b\u5171\u70b9\u4eae:", this.totalHighLightCount);
      };
      GameCtrl.prototype.addOverBingoTimes = function(pageIndex) {
        this.overBingoTimes.has(pageIndex) || this.overBingoTimes.add(pageIndex, 0);
        this.totalOverBingoTimes++;
        this.overBingoTimes.add(pageIndex, this.overBingoTimes.get(pageIndex) + 1);
        console.log("--------\u5361\u7247-", pageIndex, "- \u53e0\u52a0bingo:", this.overBingoTimes.get(pageIndex), " \u6b21", " , \u603b\u5171\u53e0\u52a0bingo:", this.totalOverBingoTimes);
      };
      GameCtrl.prototype.checkIsFull = function(pageIndex) {
        return this.highLightCardCount.get(pageIndex) && this.highLightCardCount.get(pageIndex) >= 25;
      };
      GameCtrl.prototype.clearSkillUseCount = function() {
        this.skillUseCount = 0;
      };
      GameCtrl.prototype.getSkillUsePercent = function() {
        return this.skillUseCount / Const_1.TotalSkillCount;
      };
      GameCtrl.prototype.getCurrentSkillUseCount = function() {
        return this.skillUseCount;
      };
      GameCtrl.prototype.initSkillPool = function(count) {
        for (var i = 0; i < count; i++) {
          var randomPool = [ Const_1.SkillType.Gold, Const_1.SkillType.Star, Const_1.SkillType.Time ];
          (this.skillUsedRecord[this.skillUsedRecord.length - 1] == Const_1.SkillType.Time && 0 == i || i > 0 && this.currentSkillPool[i - 1] == Const_1.SkillType.Time) && randomPool.splice(2, 1);
          if (this.skillUsedRecord.length >= 2 && this.skillUsedRecord[this.skillUsedRecord.length - 1] == this.skillUsedRecord[this.skillUsedRecord.length - 2]) {
            var index = randomPool.indexOf(this.skillUsedRecord[this.skillUsedRecord.length - 1]);
            index >= 0 && randomPool.splice(index, 1);
          }
          if (i > 2 && this.currentSkillPool[i - 1] == this.currentSkillPool[i - 2]) {
            var index = randomPool.indexOf(this.currentSkillPool[i - 1]);
            index >= 0 && randomPool.splice(index, 1);
          }
          if (randomPool.length <= 0) {
            console.warn(" random skill empty!!");
            randomPool = [ Const_1.SkillType.Gold, Const_1.SkillType.Star, Const_1.SkillType.Time ];
          }
          this.currentSkillPool.push(randomPool[Math.floor(CMath.getRandom(0, randomPool.length))]);
        }
        var logArr = [];
        for (var _i = 0, _a = this.currentSkillPool; _i < _a.length; _i++) {
          var skill = _a[_i];
          logArr.push(Const_1.SkillType[skill]);
        }
        console.log(" --------------------------- skill pool init ------------------------");
        console.log(logArr);
      };
      GameCtrl.prototype.useSkill = function(skill) {
        this.skillUsedRecord.push(skill);
        if (this.skillUseCount >= Const_1.TotalSkillCount) return;
        this.skillUseCount += 1;
      };
      GameCtrl.prototype.getSkill = function() {
        this.currentSkillPool.length <= 0 && this.initSkillPool(50);
        return this.currentSkillPool.pop();
      };
      GameCtrl.prototype.prepare = function() {
        this.score = 0;
        this.gameTime = Const_1.GameTime;
        this.streak = 0;
        this.maxStreak = 0;
        this.curClickMode = Const_1.SkillType.Normal;
        this.overBingoTimes.clear();
        this.totalOverBingoTimes = 0;
        this.totalHighLightCount = 0;
        this.highLightCardCount.clear();
        this.toolPercent = 0;
        this.bingoScore = {};
        this.bingoCache.clear();
        this.currentCardPool.clear();
        this.currentSkillPool = [];
        this.skillUsedRecord = [];
        this.skillUseCount = 0;
        this.numberRandomPool.length = Const_1.TargetRange.End - Const_1.TargetRange.Start + 1;
        var allIndex = [];
        for (var i = 0; i < this.numberRandomPool.length; i++) allIndex.push(i);
        for (var i = Const_1.TargetRange.Start; i <= Const_1.TargetRange.End; i++) {
          var randomIndex = Math.floor(CMath.getRandom(0, allIndex.length));
          this.numberRandomPool[allIndex[randomIndex]] = i;
          allIndex.splice(randomIndex, 1);
        }
        console.log(" ------------------ \u968f\u673a\u6c60 --------------------");
        console.log(this.numberRandomPool);
        this.cardNumber = Math.floor(CMath.getRandom(Const_1.CardNumber.Min, Const_1.CardNumber.Max));
        console.log(" \u5361\u7247\u6570\u91cf:", this.cardNumber);
        for (var i = 0; i < 5; i++) this.Theme = Const_1.ThemePool[Math.floor(CMath.getRandom(0, Const_1.ThemePool.length))];
        console.log("\u6e38\u620f\u4e3b\u9898:", Const_1.Theme[this.Theme]);
        this.initSkillPool(100);
      };
      GameCtrl.prototype.addGameTime = function(time) {
        this.gameTime += time;
        if (this.gameTime <= 0) {
          this.gameTime = 0;
          this.isStart = false;
          EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.GAME_OVER, Const_1.OverType.TimeUp);
        }
      };
      GameCtrl.prototype.getGameTime = function() {
        return this.gameTime;
      };
      GameCtrl.prototype.addBingoScore = function(scoreType, score) {
        this.bingoScore[scoreType] || (this.bingoScore[scoreType] = 0);
        this.bingoScore[scoreType] += score;
        this.addToolPercent(Const_1.ToolPercent[scoreType]);
      };
      GameCtrl.prototype.isPause = function() {
        return this.ispause;
      };
      return GameCtrl;
    }();
    exports.Game = GameCtrl.inst;
    true, window["Game"] = exports.Game;
    cc._RF.pop();
  }, {
    "../Const": "Const",
    "../Utils/HashMap": "HashMap",
    "./EventManager": "EventManager",
    "./EventName": "EventName"
  } ],
  GoldSkillLayer: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5c379TpPltKe7icSxr7Juma", "GoldSkillLayer");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Point_1 = require("./Point");
    var Game_1 = require("./Controller/Game");
    var Const_1 = require("./Const");
    var EventManager_1 = require("./Controller/EventManager");
    var EventName_1 = require("./Controller/EventName");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var GoldSkillLayer = function(_super) {
      __extends(GoldSkillLayer, _super);
      function GoldSkillLayer() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.selectTime = Const_1.GoldSkillTimeLimit.Select;
        _this.clickTime = Const_1.GoldSkillTimeLimit.Click;
        return _this;
      }
      Object.defineProperty(GoldSkillLayer.prototype, "SelectLayer", {
        get: function() {
          return this.node.getChildByName("Select");
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(GoldSkillLayer.prototype, "SelectTimeBar", {
        get: function() {
          return this.SelectLayer.getChildByName("SelectTimeBar").getComponent(cc.ProgressBar);
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(GoldSkillLayer.prototype, "SelectTimeLabel", {
        get: function() {
          return this.SelectTimeBar.node.getChildByName("TimeLabel").getComponent(cc.Label);
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(GoldSkillLayer.prototype, "ClickTimeLabel", {
        get: function() {
          return this.ClickTimeBar.node.getChildByName("TimeLabel").getComponent(cc.Label);
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(GoldSkillLayer.prototype, "SelectPointRoot", {
        get: function() {
          return this.SelectLayer.getChildByName("SelectRoot");
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(GoldSkillLayer.prototype, "CurrentPoint", {
        get: function() {
          return this.node.getChildByName("CurrentPoint").getComponent(Point_1.default);
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(GoldSkillLayer.prototype, "Desk", {
        get: function() {
          return this.node.getChildByName("Desk");
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(GoldSkillLayer.prototype, "ClickTimeBar", {
        get: function() {
          return this.node.getChildByName("ClickTimeBar").getComponent(cc.ProgressBar);
        },
        enumerable: true,
        configurable: true
      });
      GoldSkillLayer.prototype.onLoad = function() {
        EventManager_1.gEventMgr.on(EventName_1.GlobalEvent.GOLD_POINT_SELECT_DONE, this.selectDone, this);
      };
      GoldSkillLayer.prototype.show = function(index) {
        this.pageIndex = index;
        this.node.active = true;
        this.Desk.active = false;
        this.SelectLayer.active = true;
        this.selectTime = Const_1.GoldSkillTimeLimit.Select;
        this.clickTime = Const_1.GoldSkillTimeLimit.Click;
        for (var _i = 0, _a = this.SelectPointRoot.children; _i < _a.length; _i++) {
          var child = _a[_i];
          var point = child.getComponent(Point_1.default);
          point && point.setValue(Game_1.Game.getNextCurrentCardPoint(this.pageIndex, true));
        }
        this.SelectTimeBar.progress = 1;
        this.SelectTimeLabel.string = Math.ceil(this.selectTime).toString();
      };
      GoldSkillLayer.prototype.selectDone = function() {
        if (Game_1.Game.goldSelectValue <= 0) {
          this.node.active = false;
          EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.SKILL_DONE);
          return;
        }
        this.Desk.active = true;
        this.SelectLayer.active = false;
        this.CurrentPoint.setValue(Game_1.Game.goldSelectValue);
        this.ClickTimeLabel.string = Math.ceil(this.selectTime).toString();
        this.ClickTimeBar.progress = 1;
      };
      GoldSkillLayer.prototype.hide = function() {
        this.node.active = false;
      };
      GoldSkillLayer.prototype.update = function(dt) {
        if (!this.node.active) return;
        if (this.SelectLayer.active) {
          this.selectTime -= dt;
          this.SelectTimeBar.progress = this.selectTime / Const_1.GoldSkillTimeLimit.Select;
          this.SelectTimeLabel.string = Math.ceil(this.selectTime).toString();
          if (this.selectTime <= 0) {
            this.node.active = false;
            EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.SKILL_DONE);
          }
        } else {
          this.clickTime -= dt;
          this.ClickTimeBar.progress = this.clickTime / Const_1.GoldSkillTimeLimit.Click;
          this.ClickTimeLabel.string = Math.ceil(this.clickTime).toString();
          if (this.clickTime <= 0) {
            this.node.active = false;
            EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.SKILL_DONE);
          }
        }
      };
      GoldSkillLayer = __decorate([ ccclass ], GoldSkillLayer);
      return GoldSkillLayer;
    }(cc.Component);
    exports.default = GoldSkillLayer;
    cc._RF.pop();
  }, {
    "./Const": "Const",
    "./Controller/EventManager": "EventManager",
    "./Controller/EventName": "EventName",
    "./Controller/Game": "Game",
    "./Point": "Point"
  } ],
  Guide: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "51171YOST5DI7oenF2960D9", "Guide");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var Guide = function(_super) {
      __extends(Guide, _super);
      function Guide() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.label = null;
        _this.text = "hello";
        return _this;
      }
      Guide.prototype.start = function() {};
      __decorate([ property(cc.Label) ], Guide.prototype, "label", void 0);
      __decorate([ property ], Guide.prototype, "text", void 0);
      Guide = __decorate([ ccclass ], Guide);
      return Guide;
    }(cc.Component);
    exports.default = Guide;
    cc._RF.pop();
  }, {} ],
  HashMap: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3fb89I0oSVCL4wes+uFEx94", "HashMap");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var HashMap = function() {
      function HashMap() {
        this._list = new Array();
        this.clear();
      }
      HashMap.prototype.getIndexByKey = function(key) {
        var count = this._list.length;
        for (var index = 0; index < count; index++) {
          var element = this._list[index];
          if (element.key == key) return index;
        }
        return -1;
      };
      HashMap.prototype.keyOf = function(value) {
        var count = this._list.length;
        for (var index = 0; index < count; index++) {
          var element = this._list[index];
          if (element.value == value) return element.key;
        }
        return null;
      };
      Object.defineProperty(HashMap.prototype, "keys", {
        get: function() {
          var keys = new Array();
          for (var _i = 0, _a = this._list; _i < _a.length; _i++) {
            var element = _a[_i];
            element && keys.push(element.key);
          }
          return keys;
        },
        enumerable: true,
        configurable: true
      });
      HashMap.prototype.add = function(key, value) {
        var data = {
          key: key,
          value: value
        };
        var index = this.getIndexByKey(key);
        -1 != index ? this._list[index] = data : this._list.push(data);
      };
      Object.defineProperty(HashMap.prototype, "values", {
        get: function() {
          return this._list;
        },
        enumerable: true,
        configurable: true
      });
      HashMap.prototype.remove = function(key) {
        var index = this.getIndexByKey(key);
        if (-1 != index) {
          var data = this._list[index];
          this._list.splice(index, 1);
          return data;
        }
        return null;
      };
      HashMap.prototype.has = function(key) {
        var index = this.getIndexByKey(key);
        return -1 != index;
      };
      HashMap.prototype.get = function(key) {
        var index = this.getIndexByKey(key);
        if (-1 != index) {
          var data = this._list[index];
          return data.value;
        }
        return null;
      };
      Object.defineProperty(HashMap.prototype, "length", {
        get: function() {
          return this._list.length;
        },
        enumerable: true,
        configurable: true
      });
      HashMap.prototype.sort = function(compare) {
        this._list.sort(compare);
      };
      HashMap.prototype.forEachKeyValue = function(f) {
        var count = this._list.length;
        for (var index = 0; index < count; index++) {
          var element = this._list[index];
          f(element);
        }
      };
      HashMap.prototype.forEach = function(f) {
        var count = this._list.length;
        for (var index = 0; index < count; index++) {
          var element = this._list[index];
          f(element.key, element.value);
        }
      };
      HashMap.prototype.clear = function() {
        this._list = [];
      };
      return HashMap;
    }();
    exports.HashMap = HashMap;
    cc._RF.pop();
  }, {} ],
  Pad: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "482dbcxNt1HaKHvMljr3XXT", "Pad");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var Pad = function(_super) {
      __extends(Pad, _super);
      function Pad() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      Pad.prototype.onLoad = function() {};
      Pad.prototype.start = function() {};
      Pad = __decorate([ ccclass ], Pad);
      return Pad;
    }(cc.Component);
    exports.default = Pad;
    cc._RF.pop();
  }, {} ],
  Point: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9e72aDeGvxJjI3bwYHxFww7", "Point");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Game_1 = require("./Controller/Game");
    var Const_1 = require("./Const");
    var EventManager_1 = require("./Controller/EventManager");
    var EventName_1 = require("./Controller/EventName");
    var CelerSDK_1 = require("./Controller/CelerSDK");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var Point = function(_super) {
      __extends(Point, _super);
      function Point() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.totalTime = 0;
        _this.currentTime = 0;
        _this.value = 0;
        return _this;
      }
      Object.defineProperty(Point.prototype, "TimeBar", {
        get: function() {
          return this.node.getChildByName("TimeBar").getComponent(cc.ProgressBar);
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Point.prototype, "Icon", {
        get: function() {
          return this.node.getChildByName("Icon");
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Point.prototype, "NumberLabel", {
        get: function() {
          return this.node.getChildByName("Label").getChildByName("Number").getComponent(cc.Label);
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Point.prototype, "CurrentTime", {
        get: function() {
          return this.currentTime;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Point.prototype, "TotalTime", {
        get: function() {
          return this.totalTime;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Point.prototype, "StringValue", {
        get: function() {
          return this.word + "." + this.value;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Point.prototype, "TimeLeftPercent", {
        get: function() {
          if (this.totalTime <= 0) return 0;
          return this.currentTime / this.totalTime;
        },
        enumerable: true,
        configurable: true
      });
      Point.prototype.onSetParent = function(parent) {
        if (parent) {
          this.TimeBar.node.active = "CurrentPoint" == parent.name;
          if (this.TimeBar.node.active) {
            Game_1.Game.getGameTime() >= Const_1.TimeLimit ? this.totalTime = Const_1.RewardTime.One : this.totalTime = Const_1.RewardTime.Two;
            this.currentTime = this.totalTime;
          } else {
            this.totalTime = 0;
            this.currentTime = 0;
          }
        }
      };
      Object.defineProperty(Point.prototype, "isGoldSelectMode", {
        get: function() {
          return "SelectRoot" == this.node.getParent().name;
        },
        enumerable: true,
        configurable: true
      });
      Point.prototype.onLoad = function() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouch, this);
      };
      Point.prototype.reuse = function() {
        this.node["_onSetParent"] = this.onSetParent.bind(this);
        this.TimeBar.progress = 1;
        this.TimeBar.node.active = false;
        this.node.scale = 1;
        this.setValue(arguments[0][0]);
      };
      Point.prototype.onTouch = function(e) {
        console.log(this.node.parent.name);
        if (this.isGoldSelectMode) {
          Game_1.Game.goldSelectValue = this.value;
          EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.GOLD_POINT_SELECT_DONE);
        }
      };
      Point.prototype.setValue = function(val) {
        this.value = val;
        for (var i = Const_1.CardWord.B; i <= Const_1.CardWord.O; i++) if (this.value >= (i - 1) * Const_1.CardStep + 1 && this.value <= i * Const_1.CardStep) {
          this.word = i;
          break;
        }
        this.NumberLabel.string = this.value.toString();
        for (var _i = 0, _a = this.Icon.children; _i < _a.length; _i++) {
          var child = _a[_i];
          child.active = child.name == Const_1.CardWord[this.word];
        }
      };
      Point.prototype.unuse = function() {
        this.node.targetOff(this);
      };
      Point.prototype.update = function(dt) {
        if (this.TimeBar.node.active && this.totalTime > 0 && !Game_1.Game.isPause()) {
          this.currentTime -= dt;
          this.TimeBar.progress = this.currentTime / this.totalTime;
          this.TimeBar.node.active = this.currentTime > 0;
          this.currentTime <= 0 && this.goToRewardArray();
        }
      };
      Point.prototype.addTime = function(time) {
        if (CelerSDK_1.CelerSDK.inst.isOnCelerPlatform()) return;
        if (Const_1.RewardTime.One < 10) return;
        this.currentTime += time;
        this.currentTime = Math.max(0, this.currentTime);
      };
      Point.prototype.goToRewardArray = function() {
        this.TimeBar.node.active = false;
        EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.ADD_2_NORMAL_REWARD, this.node);
      };
      Point = __decorate([ ccclass ], Point);
      return Point;
    }(cc.Component);
    exports.default = Point;
    cc._RF.pop();
  }, {
    "./Const": "Const",
    "./Controller/CelerSDK": "CelerSDK",
    "./Controller/EventManager": "EventManager",
    "./Controller/EventName": "EventName",
    "./Controller/Game": "Game"
  } ],
  Score: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "145bfRPC9pPLaM0crpB/9nD", "Score");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var Score = function(_super) {
      __extends(Score, _super);
      function Score() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.setParentCallback = null;
        return _this;
      }
      Object.defineProperty(Score.prototype, "ScoreFail", {
        get: function() {
          return this.node.getChildByName("ScoreFail").getComponent(cc.Label);
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Score.prototype, "ScoreSuccess", {
        get: function() {
          return this.node.getChildByName("Score").getComponent(cc.Label);
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Score.prototype, "Text", {
        get: function() {
          return this.node.getChildByName("Text").getComponent(cc.Sprite);
        },
        enumerable: true,
        configurable: true
      });
      Score.prototype.onSetParent = function(parent) {
        parent && this.setParentCallback && this.setParentCallback();
      };
      Score.prototype.reuse = function() {
        var _this = this;
        this.node["_onSetParent"] = this.onSetParent.bind(this);
        var score = arguments[0][0];
        var scale = arguments[0][1];
        var target = arguments[0][2];
        var callback = arguments[0][3];
        var text = arguments[0][4];
        this.Text.node.active = null != text;
        if (score > 0) {
          this.ScoreSuccess.string = "/" + score.toString();
          this.ScoreFail.string = "";
        } else {
          this.ScoreFail.string = "/" + Math.abs(score).toString();
          this.ScoreSuccess.string = "";
        }
        var scoreLabel = score > 0 ? this.ScoreSuccess : this.ScoreFail;
        if (this.Text.node.active) {
          this.Text.spriteFrame = text;
          scoreLabel.node.x = 0;
        } else scoreLabel.node.x = -70 * scoreLabel.string.length / 2;
        this.ScoreFail.node.scale = 0;
        this.ScoreSuccess.node.scale = 0;
        this.setParentCallback = function() {
          var dis = CMath.Distance(target.position, _this.node.position);
          var moveTime = dis / 1950;
          var targetPos = CMath.ConvertToNodeSpaceAR(target, _this.node);
          var delayTime = 0;
          var labelActions = [];
          if (_this.Text.node.active) {
            _this.Text.node.scale = 0;
            _this.Text.node.opacity = 255;
            _this.Text.node.runAction(cc.sequence(cc.scaleTo(.1, 1.2 * scale), cc.delayTime(.4), cc.scaleTo(.1, 1 * scale), cc.delayTime(0), cc.spawn(cc.scaleTo(.3, 0), cc.fadeOut(.1))));
            delayTime = .2;
          }
          labelActions = [ cc.delayTime(delayTime), cc.scaleTo(.1, 1.2 * scale), cc.delayTime(.2), cc.scaleTo(.1, 1 * scale), cc.callFunc(function() {
            _this.node.runAction(cc.sequence(cc.delayTime(moveTime / 2), cc.callFunc(function() {
              _this.node.setParent(_this.node.getParent().getParent());
            })));
          }), cc.spawn(cc.moveTo(moveTime, targetPos).easing(cc.easeInOut(1)), cc.fadeOut(moveTime)), cc.scaleTo(.3, 0), cc.callFunc(function() {
            callback && callback();
          }) ];
          scoreLabel.node.runAction(cc.sequence(labelActions));
        };
      };
      Score.prototype.unuse = function() {
        console.log(" score - unuse-----------------------------");
        this.Text.node.x = 0;
        this.Text.node.y = 0;
        this.Text.node.stopAllActions();
        this.ScoreFail.node.x = 0;
        this.ScoreFail.node.y = 22;
        this.ScoreSuccess.node.x = 0;
        this.ScoreSuccess.node.y = 22;
        this.ScoreFail.node.stopAllActions();
        this.ScoreFail.node.scale = 1;
        this.ScoreFail.node.opacity = 255;
        this.ScoreSuccess.node.stopAllActions();
        this.ScoreSuccess.node.scale = 1;
        this.ScoreSuccess.node.opacity = 255;
        this.node.stopAllActions();
        this.setParentCallback = null;
      };
      Score = __decorate([ ccclass ], Score);
      return Score;
    }(cc.Component);
    exports.default = Score;
    cc._RF.pop();
  }, {} ],
  Skill: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "02d8d4FjeFEz4GYY7djfM63", "Skill");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var GameFactory_1 = require("./Controller/GameFactory");
    var Game_1 = require("./Controller/Game");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var Skill = function(_super) {
      __extends(Skill, _super);
      function Skill() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      Object.defineProperty(Skill.prototype, "Background", {
        get: function() {
          return this.node.getChildByName("Background").getComponent(cc.Sprite);
        },
        enumerable: true,
        configurable: true
      });
      Skill.prototype.reuse = function() {
        var _this = this;
        this.node.scale = 0;
        this.pressCallback = arguments[0][0];
        this.Background.spriteFrame = arguments[0][1];
        this.skillType = arguments[0][2];
        this.node.on(cc.Node.EventType.TOUCH_END, function() {
          if (_this.node.zIndex != _this.node.getParent().childrenCount || _this.node.scale <= .98 || _this.node.scale >= 1.1) return;
          Game_1.Game.useSkill(_this.skillType);
          if (_this.pressCallback) {
            _this.pressCallback();
            _this.pressCallback = null;
          }
          GameFactory_1.gFactory.putObj("Skill", _this.node);
        }, this);
        this.node.runAction(cc.sequence(cc.scaleTo(.13, 1.2), cc.delayTime(.2), cc.scaleTo(.1, 1)));
      };
      Skill.prototype.unuse = function() {
        this.node.targetOff(this);
        this.node.stopAllActions();
        this.pressCallback = null;
      };
      Skill = __decorate([ ccclass ], Skill);
      return Skill;
    }(cc.Component);
    exports.default = Skill;
    cc._RF.pop();
  }, {
    "./Controller/Game": "Game",
    "./Controller/GameFactory": "GameFactory"
  } ],
  StepController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5e60515g5pBlJXudFf1Z4T3", "StepController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var StepController = function() {
      function StepController() {
        this.totalStep = [];
        this.curStep = [];
      }
      Object.defineProperty(StepController, "inst", {
        get: function() {
          return this._ins ? this._ins : this._ins = new StepController();
        },
        enumerable: true,
        configurable: true
      });
      StepController.prototype.register = function(complete, totalSteps) {
        this.completeCallback = complete;
        this.totalStep = totalSteps;
      };
      StepController.prototype.nextStep = function(step) {
        if (this.totalStep.indexOf(step) < 0) {
          console.error(" \u6ca1\u6709\u8fd9\u4e00\u6b65\uff1a", step);
          return;
        }
        if (this.curStep.indexOf(step) >= 0) {
          console.warn(" \u6b65\u9aa4\u5df2\u5b8c\u6210\uff1a", step);
          return;
        }
        this.curStep.push(step);
        this.curStep.sort(function(a, b) {
          return a > b ? -1 : 1;
        });
        this.totalStep.sort(function(a, b) {
          return a > b ? -1 : 1;
        });
        console.log(" cur step:", this.curStep.join(","));
        console.log(" total step:", this.totalStep.join(","));
        if (this.curStep.join(",") == this.totalStep.join(",")) {
          this.totalStep.length = 0;
          this.completeCallback();
          this.completeCallback = null;
        }
      };
      return StepController;
    }();
    exports.gStep = StepController.inst;
    cc._RF.pop();
  }, {} ],
  SuperSkillLayer: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d8917JXrNNKupwEf3iWB7n+", "SuperSkillLayer");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Const_1 = require("./Const");
    var EventManager_1 = require("./Controller/EventManager");
    var EventName_1 = require("./Controller/EventName");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SuperSkillLayer = function(_super) {
      __extends(SuperSkillLayer, _super);
      function SuperSkillLayer() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.time = 0;
        return _this;
      }
      Object.defineProperty(SuperSkillLayer.prototype, "TimeBar", {
        get: function() {
          return this.node.getChildByName("TimeBar").getComponent(cc.ProgressBar);
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(SuperSkillLayer.prototype, "TimeLabel", {
        get: function() {
          return this.TimeBar.node.getChildByName("TimeLabel").getComponent(cc.Label);
        },
        enumerable: true,
        configurable: true
      });
      SuperSkillLayer.prototype.show = function() {
        this.time = Const_1.SuperTime.LastTime;
        this.node.active = true;
        this.TimeBar.progress = 1;
        this.TimeLabel.string = Math.ceil(this.time).toString();
      };
      SuperSkillLayer.prototype.hide = function() {
        this.node.active = false;
      };
      SuperSkillLayer.prototype.update = function(dt) {
        if (this.node.active) {
          this.time -= dt;
          this.TimeLabel.string = Math.ceil(this.time).toString();
          this.TimeBar.progress = this.time / Const_1.SuperTime.LastTime;
          if (this.time <= 0) {
            this.node.active = false;
            EventManager_1.gEventMgr.emit(EventName_1.GlobalEvent.SKILL_DONE);
          }
        }
      };
      SuperSkillLayer = __decorate([ ccclass ], SuperSkillLayer);
      return SuperSkillLayer;
    }(cc.Component);
    exports.default = SuperSkillLayer;
    cc._RF.pop();
  }, {
    "./Const": "Const",
    "./Controller/EventManager": "EventManager",
    "./Controller/EventName": "EventName"
  } ],
  celerx: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "10d05zhUHtDfJgPk46aOLCS", "celerx");
    "use strict";
    var _typeof2 = "function" === typeof Symbol && "symbol" === typeof Symbol.iterator ? function(obj) {
      return typeof obj;
    } : function(obj) {
      return obj && "function" === typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    function binary_to_base64(e) {
      for (var r = new Uint8Array(e), t = new Array(), n = 0, i = 0, a = new Array(3), o = new Array(4), d = r.length, c = 0; d--; ) if (a[n++] = r[c++], 
      3 == n) {
        for (o[0] = (252 & a[0]) >> 2, o[1] = ((3 & a[0]) << 4) + ((240 & a[1]) >> 4), o[2] = ((15 & a[1]) << 2) + ((192 & a[2]) >> 6), 
        o[3] = 63 & a[2], n = 0; n < 4; n++) t += base64_chars.charAt(o[n]);
        n = 0;
      }
      if (n) {
        for (i = n; i < 3; i++) a[i] = 0;
        for (o[0] = (252 & a[0]) >> 2, o[1] = ((3 & a[0]) << 4) + ((240 & a[1]) >> 4), o[2] = ((15 & a[1]) << 2) + ((192 & a[2]) >> 6), 
        o[3] = 63 & a[2], i = 0; i < n + 1; i++) t += base64_chars.charAt(o[i]);
        for (;n++ < 3; ) t += "=";
      }
      return t;
    }
    function dec2hex(e) {
      for (var r = hD.substr(15 & e, 1); e > 15; ) e >>= 4, r = hD.substr(15 & e, 1) + r;
      return r;
    }
    function base64_decode(e) {
      var r, t, n, i, a, o, d, c = new Array(), s = 0, u = e;
      if (e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""), u != e && alert("Warning! Characters outside Base64 range in input string ignored."), 
      e.length % 4) return alert("Error: Input length is not a multiple of 4 bytes."), 
      "";
      for (var l = 0; s < e.length; ) i = keyStr.indexOf(e.charAt(s++)), a = keyStr.indexOf(e.charAt(s++)), 
      o = keyStr.indexOf(e.charAt(s++)), d = keyStr.indexOf(e.charAt(s++)), r = i << 2 | a >> 4, 
      t = (15 & a) << 4 | o >> 2, n = (3 & o) << 6 | d, c[l++] = r, 64 != o && (c[l++] = t), 
      64 != d && (c[l++] = n);
      return c;
    }
    var _typeof = "function" == typeof Symbol && "symbol" == _typeof2(Symbol.iterator) ? function(e) {
      return "undefined" === typeof e ? "undefined" : _typeof2(e);
    } : function(e) {
      return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : "undefined" === typeof e ? "undefined" : _typeof2(e);
    }, bridge = {
      default: void 0,
      call: function call(e, r, t) {
        var n = "";
        if ("function" == typeof r && (t = r, r = {}), r = {
          data: void 0 === r ? null : r
        }, "function" == typeof t) {
          var i = "dscb" + window.dscb++;
          window[i] = t, r._dscbstub = i;
        }
        return r = JSON.stringify(r), window._dsbridge ? n = _dsbridge.call(e, r) : (window._dswk || -1 != navigator.userAgent.indexOf("_dsbridge")) && (n = prompt("_dsbridge=" + e, r)), 
        JSON.parse(n || "{}").data;
      },
      register: function register(e, r, t) {
        t = t ? window._dsaf : window._dsf, window._dsInit || (window._dsInit = !0, setTimeout(function() {
          bridge.call("_dsb.dsinit");
        }, 0)), "object" == (void 0 === r ? "undefined" : _typeof(r)) ? t._obs[e] = r : t[e] = r;
      },
      registerAsyn: function registerAsyn(e, r) {
        this.register(e, r, !0);
      },
      hasNativeMethod: function hasNativeMethod(e, r) {
        return this.call("_dsb.hasNativeMethod", {
          name: e,
          type: r || "all"
        });
      },
      disableJavascriptDialogBlock: function disableJavascriptDialogBlock(e) {
        this.call("_dsb.disableJavascriptDialogBlock", {
          disable: !1 !== e
        });
      }
    };
    !function() {
      if (!window._dsf) {
        var e, r = {
          _dsf: {
            _obs: {}
          },
          _dsaf: {
            _obs: {}
          },
          dscb: 0,
          celerx: bridge,
          close: function close() {
            bridge.call("_dsb.closePage");
          },
          _handleMessageFromNative: function _handleMessageFromNative(e) {
            var r = JSON.parse(e.data), t = {
              id: e.callbackId,
              complete: !0
            }, n = this._dsf[e.method], i = this._dsaf[e.method], a = function a(e, n) {
              t.data = e.apply(n, r), bridge.call("_dsb.returnValue", t);
            }, o = function o(e, n) {
              r.push(function(e, r) {
                t.data = e, t.complete = !1 !== r, bridge.call("_dsb.returnValue", t);
              }), e.apply(n, r);
            };
            if (n) a(n, this._dsf); else if (i) o(i, this._dsaf); else if (n = e.method.split("."), 
            !(2 > n.length)) {
              e = n.pop();
              var n = n.join("."), i = this._dsf._obs, i = i[n] || {}, d = i[e];
              d && "function" == typeof d ? a(d, i) : (i = this._dsaf._obs, i = i[n] || {}, (d = i[e]) && "function" == typeof d && o(d, i));
            }
          }
        };
        for (e in r) window[e] = r[e];
        bridge.register("_hasJavascriptMethod", function(e, r) {
          return r = e.split("."), 2 > r.length ? !(!_dsf[r] && !_dsaf[r]) : (e = r.pop(), 
          r = r.join("."), (r = _dsf._obs[r] || _dsaf._obs[r]) && !!r[e]);
        });
      }
    }();
    var base64_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", hD = "0123456789ABCDEF", keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", _provideScore = {
      callback: function callback() {
        return "";
      }
    }, _provideCurrentFrameData = {
      callback: function callback() {
        return "";
      }
    };
    bridge.register("provideScore", function() {
      return _provideScore.callback();
    }), bridge.register("provideCurrentFrameData", function() {
      return _provideCurrentFrameData.callback();
    }), module.exports = {
      onStateReceived: function onStateReceived(e) {
        return bridge.register("onStateReceived", function(r) {
          var t = base64_decode(r);
          return e(new Uint8Array(t));
        });
      },
      onCourtModeStarted: function onCourtModeStarted(e) {
        return bridge.register("onCourtModeStarted", e);
      },
      getMatch: function getMatch() {
        var e = bridge.call("getMatch", "123");
        try {
          e = JSON.parse(e);
        } catch (e) {}
        return e;
      },
      showCourtModeDialog: function showCourtModeDialog() {
        return bridge.call("showCourtModeDialog");
      },
      start: function start() {
        return bridge.call("start");
      },
      sendState: function sendState(e) {
        return bridge.call("sendState", binary_to_base64(e));
      },
      draw: function draw(e) {
        return bridge.call("draw", binary_to_base64(e));
      },
      win: function win(e) {
        return bridge.call("win", binary_to_base64(e));
      },
      lose: function lose(e) {
        return bridge.call("lose", binary_to_base64(e));
      },
      surrender: function surrender(e) {
        return bridge.call("surrender", binary_to_base64(e));
      },
      applyAction: function applyAction(e, r) {
        return bridge.call("applyAction", binary_to_base64(e), r);
      },
      getOnChainState: function getOnChainState(e) {
        return bridge.call("getOnChainState", "123", function(r) {
          var t = base64_decode(r);
          return e(new Uint8Array(t));
        });
      },
      getOnChainActionDeadline: function getOnChainActionDeadline(e) {
        return bridge.call("getOnChainActionDeadline", "123", e);
      },
      getCurrentBlockNumber: function getCurrentBlockNumber() {
        return bridge.call("getCurrentBlockNumber", "123");
      },
      finalizeOnChainGame: function finalizeOnChainGame(e) {
        return bridge.call("finalizeOnChainGame", "123", e);
      },
      submitScore: function submitScore(e) {
        return bridge.call("submitScore", e);
      },
      ready: function ready() {
        return bridge.call("ready");
      },
      onStart: function onStart(e) {
        return bridge.register("onStart", e);
      },
      provideScore: function provideScore(e) {
        return _provideScore = {
          callback: e
        };
      },
      provideCurrentFrameData: function provideCurrentFrameData(e) {
        return _provideCurrentFrameData = {
          callback: e
        };
      },
      didTakeSnapshot: function didTakeSnapshot(e) {
        return bridge.call("didTakeSnapshot", e);
      },
      log: function log(e) {
        return bridge.call("log", e);
      }
    };
    cc._RF.pop();
  }, {} ]
}, {}, [ "Card", "Const", "AudioController", "CelerSDK", "EventManager", "EventName", "Game", "GameFactory", "StepController", "GameScene", "GoldSkillLayer", "Guide", "Point", "Score", "Skill", "SuperSkillLayer", "Pad", "HashMap", "celerx" ]);